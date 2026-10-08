import {
  act,
  fireEvent,
  renderAsync,
  screen,
  userEvent,
  waitFor,
} from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';

import TwoFactorAuth from '@/app/(auth)/2Auth';
import RecoveryCodeScreen from '@/app/(auth)/ForgotPassword/2authScreen';
import ChangePasswordScreen from '@/app/(auth)/ForgotPassword/ChangePassword';
import EmailScreen from '@/app/(auth)/ForgotPassword/EmailScreen';
import Login from '@/app/(auth)/Login';
import ResetPasswordScreen from '@/app/(main)/ResetPassword';
import useAuth from '@/contexts/Auth/useAuth';
import { useErrorModal } from '@/store/errorModalStore';
import { useOTPStore } from '@/store/otpStore';

jest.mock('@/contexts/Auth/useAuth', () => ({
  __esModule: true,
  default: jest.fn(),
  useAuth: jest.fn(),
}));
// Both imports should refer to the same hook mock.
const mockAuth = jest.requireMock('@/contexts/Auth/useAuth');
const login = jest.fn();
const completeLogin = jest.fn();
const resendOTPCode = jest.fn();

beforeEach(() => {
  jest.useFakeTimers();
  const auth = { login, completeLogin, resendOTPCode };
  jest.mocked(useAuth).mockReturnValue(auth as never);
  mockAuth.useAuth.mockReturnValue(auth);
  login.mockReset().mockResolvedValue(undefined);
  completeLogin.mockReset().mockResolvedValue(undefined);
  resendOTPCode.mockReset().mockResolvedValue(undefined);
  useErrorModal.getState().closeErrorModal();
  useOTPStore.getState().clearOTPData();
});
afterEach(() => jest.useRealTimers());

it('valida login, envia dados e permite acessar cadastro e recuperação', async () => {
  jest.mocked(useLocalSearchParams).mockReturnValue({ animateLogo: '1' });
  await renderAsync(<Login />);
  fireEvent.press(screen.getByText('Entrar'));
  expect(await screen.findByText('Senha é obrigatória')).toBeOnTheScreen();
  expect(login).not.toHaveBeenCalled();
  fireEvent.changeText(
    screen.getByPlaceholderText('Digite seu e-mail'),
    'ana@pulso.app',
  );
  fireEvent.changeText(
    screen.getByPlaceholderText('Digite sua senha'),
    'Password1',
  );
  act(() => jest.advanceTimersByTime(1200));
  fireEvent.press(screen.getByText('Entrar'));
  await waitFor(() =>
    expect(login).toHaveBeenCalledWith({
      email: 'ana@pulso.app',
      password: 'Password1',
      rememberMe: false,
    }),
  );
  fireEvent.press(screen.getByText('Esqueceu a senha?'));
  expect(router.push).toHaveBeenCalledWith('../ForgotPassword/EmailScreen');
  fireEvent.press(screen.getByRole('link', { name: 'Cadastre-se' }));
  expect(router.push).toHaveBeenCalledWith('../Register');
});

it.each([
  [
    { isAxiosError: true, response: { status: 401 } },
    'E-mail ou senha incorretos. Verifique os dados e tente novamente.',
  ],
  [new Error('Offline'), 'Offline'],
])('apresenta falhas de login (%#)', async (error, message) => {
  login.mockRejectedValue(error);
  await renderAsync(<Login />);
  fireEvent.changeText(
    screen.getByPlaceholderText('Digite seu e-mail'),
    'ana@pulso.app',
  );
  fireEvent.changeText(
    screen.getByPlaceholderText('Digite sua senha'),
    'secret',
  );
  fireEvent.press(screen.getByText('Entrar'));
  await waitFor(() =>
    expect(useErrorModal.getState().modal?.message).toBe(message),
  );
});

const setChallenge = (resendDelay = 0, expires = 60000) =>
  useOTPStore.getState().setOTPData({
    email: 'ana@pulso.app',
    codeExpiresAt: new Date(Date.now() + expires).toISOString(),
    resendAvailableAt: new Date(Date.now() + resendDelay).toISOString(),
  });

it('redireciona para login sem desafio OTP', async () => {
  await renderAsync(<TwoFactorAuth />);
  expect(screen.getByText('/(auth)/Login')).toBeOnTheScreen();
});

it('normaliza código, confirma 2FA e respeita o prazo de reenvio', async () => {
  setChallenge(3000);
  await renderAsync(<TwoFactorAuth />);
  expect(screen.getByRole('button', { name: 'Reenviar' })).toBeDisabled();
  fireEvent.changeText(
    screen.getByLabelText('Código de verificação de seis dígitos'),
    'a01234567',
  );
  fireEvent.press(screen.getByText('Confirmar'));
  await waitFor(() =>
    expect(completeLogin).toHaveBeenCalledWith(
      expect.objectContaining({ code: '012345' }),
    ),
  );
  act(() => jest.advanceTimersByTime(3000));
  await userEvent
    .setup()
    .press(screen.getByRole('button', { name: 'Reenviar' }));
  expect(resendOTPCode).toHaveBeenCalledTimes(1);
  expect(
    screen.getByLabelText('Código de verificação de seis dígitos'),
  ).toHaveDisplayValue('');
  act(() => jest.advanceTimersByTime(60000));
  expect(
    screen.getByText('Código expirado. Solicite um novo código.'),
  ).toBeOnTheScreen();
});

it('apresenta erros ao confirmar e reenviar OTP', async () => {
  setChallenge();
  completeLogin.mockRejectedValue(new Error('Código inválido'));
  resendOTPCode.mockRejectedValue(new Error('Falha no reenvio'));
  await renderAsync(<TwoFactorAuth />);
  fireEvent.changeText(
    screen.getByLabelText('Código de verificação de seis dígitos'),
    '123456',
  );
  fireEvent.press(screen.getByText('Confirmar'));
  await waitFor(() =>
    expect(useErrorModal.getState().modal?.message).toBe('Código inválido'),
  );
  await userEvent
    .setup()
    .press(screen.getByRole('button', { name: 'Reenviar' }));
  expect(useErrorModal.getState().modal?.message).toBe('Falha no reenvio');
});

it('valida e-mail de recuperação e encaminha ao código após confirmação', async () => {
  await renderAsync(<EmailScreen />);
  fireEvent.changeText(screen.getByLabelText('E-mail'), 'invalid');
  expect(
    await screen.findByText('Digite um e-mail válido, como nome@gmail.com.'),
  ).toBeOnTheScreen();
  fireEvent.changeText(screen.getByLabelText('E-mail'), ' ana@pulso.app ');
  await act(async () => {});
  fireEvent.press(screen.getByText('Prosseguir'));
  expect(await screen.findByText('Sucesso!')).toBeOnTheScreen();
  fireEvent.press(screen.getByText('Continuar'));
  expect(router.push).toHaveBeenCalledWith(
    { pathname: '../2authScreen', params: { email: 'ana@pulso.app' } },
    { relativeToDirectory: true },
  );
});

it('recuperação permite código completo e renova o prazo ao reenviar', async () => {
  await renderAsync(<RecoveryCodeScreen />);
  expect(screen.getByText('05:00')).toBeOnTheScreen();
  fireEvent.changeText(
    screen.getByLabelText('Código de verificação de seis dígitos'),
    '123456',
  );
  fireEvent.press(screen.getByText('Confirmar'));
  expect(router.push).toHaveBeenCalledWith(
    '/(auth)/ForgotPassword/ChangePassword',
  );
  await userEvent
    .setup()
    .press(screen.getByRole('button', { name: 'Reenviar' }));
  fireEvent.press(screen.getByText('Continuar'));
  expect(screen.getByRole('button', { name: 'Reenviar' })).toBeDisabled();
  act(() => jest.advanceTimersByTime(300000));
  expect(screen.getByText('Código expirado')).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Reenviar' })).toBeEnabled();
});

it('alteração de senha exige requisitos e confirmação e retorna ao login', async () => {
  await renderAsync(<ChangePasswordScreen />);
  fireEvent.changeText(screen.getByLabelText('Senha'), 'Password1');
  fireEvent.changeText(screen.getByLabelText('Confirmar senha'), 'Password2');
  expect(
    await screen.findByText('As senhas devem ser iguais.'),
  ).toBeOnTheScreen();
  fireEvent.changeText(screen.getByLabelText('Confirmar senha'), 'Password1');
  await act(async () => {});
  fireEvent.press(screen.getByText('Salvar'));
  expect(
    await screen.findByText(
      'Sua senha foi alterada com sucesso. Entre com sua nova senha.',
    ),
  ).toBeOnTheScreen();
  fireEvent.press(screen.getByText('Voltar ao login'));
  expect(router.dismissTo).toHaveBeenCalledWith('/(auth)/Login');
});

it('redefinição de senha mostra/oculta entrada e informa indisponibilidade', async () => {
  await renderAsync(<ResetPasswordScreen />);
  const user = userEvent.setup();
  await user.press(screen.getByRole('button', { name: 'Mostrar senha' }));
  expect(screen.getByLabelText('Senha')).toHaveProp('secureTextEntry', false);
  await user.press(screen.getByRole('button', { name: 'Ocultar senha' }));
  expect(screen.getByLabelText('Senha')).toHaveProp('secureTextEntry', true);
  fireEvent.changeText(screen.getByLabelText('Senha'), 'Password1');
  fireEvent.changeText(screen.getByLabelText('Confirmar senha'), 'Password1');
  await user.press(screen.getByRole('button', { name: 'Salvar' }));
  expect(await screen.findByRole('alert')).toHaveTextContent(
    /A alteração de senha ainda não está disponível/,
  );
  await user.press(screen.getByRole('button', { name: 'Voltar' }));
  expect(router.replace).toHaveBeenCalledWith('/(main)/Profile');
});
