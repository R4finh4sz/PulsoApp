import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactElement } from 'react';
import { Modal } from 'react-native';
import { passwordRecoveryService } from '@/services/passwordRecovery';
import { authService } from '@/services/auth';
import { usePasswordRecoveryStore } from '@/store/passwordRecoveryStore';
import {
  act,
  fireEvent,
  renderAsync as renderNativeAsync,
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

const renderAsync = (ui: ReactElement) => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false, gcTime: 0 },
    },
  });
  return renderNativeAsync(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });
};
jest.mock('@/services/passwordRecovery', () => ({
  passwordRecoveryService: {
    request: jest.fn(),
    verify: jest.fn(),
    reset: jest.fn(),
  },
}));
jest.mock('@/services/auth', () => ({
  authService: { changePassword: jest.fn() },
}));
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
const logout = jest.fn();

beforeEach(() => {
  jest.useFakeTimers();
  jest
    .mocked(authService.changePassword)
    .mockReset()
    .mockResolvedValue(undefined);
  usePasswordRecoveryStore.getState().setRecovery(null);
  jest
    .mocked(passwordRecoveryService.request)
    .mockReset()
    .mockResolvedValue(undefined);
  jest
    .mocked(passwordRecoveryService.verify)
    .mockReset()
    .mockResolvedValue({
      resetToken: 'test-token',
      expiresAt: new Date(Date.now() + 600000).toISOString(),
    });
  jest
    .mocked(passwordRecoveryService.reset)
    .mockReset()
    .mockResolvedValue(undefined);
  logout.mockReset().mockResolvedValue(undefined);
  const auth = { login, completeLogin, resendOTPCode, logout };
  jest.mocked(useAuth).mockReturnValue(auth as never);
  mockAuth.useAuth.mockReturnValue(auth);
  login.mockReset().mockResolvedValue(undefined);
  completeLogin.mockReset().mockResolvedValue(undefined);
  resendOTPCode.mockReset().mockResolvedValue(undefined);
  useErrorModal.getState().closeErrorModal();
  useOTPStore.getState().clearOTPData();
});
afterEach(() => jest.useRealTimers());

it('preserva o fluxo quando o servidor rejeita o código', async () => {
  usePasswordRecoveryStore
    .getState()
    .setRecovery({ email: 'ana@pulso.app', requestedAt: Date.now() });
  jest
    .mocked(passwordRecoveryService.verify)
    .mockRejectedValue(new Error('Código inválido'));
  await renderAsync(<RecoveryCodeScreen />);
  expect(screen.getByRole('button', { name: 'Reenviar' })).toBeDisabled();
  fireEvent.changeText(
    screen.getByLabelText('Código de verificação de seis dígitos'),
    '012345',
  );
  fireEvent.press(screen.getByText('Confirmar'));
  await waitFor(() =>
    expect(useErrorModal.getState().modal?.message).toBe('Código inválido'),
  );
  expect(router.push).not.toHaveBeenCalled();
  expect(
    usePasswordRecoveryStore.getState().recovery?.resetToken,
  ).toBeUndefined();
});

it('não anuncia sucesso se a solicitação falhar', async () => {
  jest
    .mocked(passwordRecoveryService.request)
    .mockRejectedValue(new Error('Sem conexão'));
  await renderAsync(<EmailScreen />);
  fireEvent.changeText(screen.getByLabelText('E-mail'), 'ana@pulso.app');
  await act(async () => {});
  fireEvent.press(screen.getByText('Prosseguir'));
  await waitFor(() =>
    expect(useErrorModal.getState().modal?.message).toBe('Sem conexão'),
  );
  expect(screen.queryByText('Sucesso!')).not.toBeOnTheScreen();
  expect(usePasswordRecoveryStore.getState().recovery).toBeNull();
});

it('impede o envio da nova senha com token expirado', async () => {
  usePasswordRecoveryStore.getState().setRecovery({
    email: 'ana@pulso.app',
    requestedAt: Date.now(),
    resetToken: 'expired',
    expiresAt: new Date(Date.now() - 1000).toISOString(),
  });
  await renderAsync(<ChangePasswordScreen />);
  fireEvent.changeText(screen.getByLabelText('Senha'), 'Password1');
  fireEvent.changeText(screen.getByLabelText('Confirmar senha'), 'Password1');
  await act(async () => {});
  fireEvent.press(screen.getByText('Salvar'));
  await waitFor(() =>
    expect(useErrorModal.getState().modal?.message).toMatch(
      /Solicite um novo código/,
    ),
  );
  expect(passwordRecoveryService.reset).not.toHaveBeenCalled();
});

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
  usePasswordRecoveryStore
    .getState()
    .setRecovery({ email: 'ana@pulso.app', requestedAt: Date.now() });
  await renderAsync(<RecoveryCodeScreen />);
  expect(screen.getByText('10:00')).toBeOnTheScreen();
  fireEvent.changeText(
    screen.getByLabelText('Código de verificação de seis dígitos'),
    '123456',
  );
  fireEvent.press(screen.getByText('Confirmar'));
  await waitFor(() =>
    expect(router.push).toHaveBeenCalledWith(
      '/(auth)/ForgotPassword/ChangePassword',
    ),
  );
  expect(passwordRecoveryService.verify).toHaveBeenCalledWith(
    'ana@pulso.app',
    '123456',
  );
  act(() => jest.advanceTimersByTime(180000));
  await userEvent
    .setup()
    .press(screen.getByRole('button', { name: 'Reenviar' }));
  fireEvent.press(await screen.findByText('Continuar'));
  expect(screen.getByRole('button', { name: 'Reenviar' })).toBeDisabled();
  act(() => jest.advanceTimersByTime(601000));
  expect(screen.getByText('Código expirado')).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Reenviar' })).toBeEnabled();
});

it('alteração de senha exige requisitos e confirmação e retorna ao login', async () => {
  usePasswordRecoveryStore.getState().setRecovery({
    email: 'ana@pulso.app',
    requestedAt: Date.now(),
    resetToken: 'test-token',
    expiresAt: new Date(Date.now() + 600000).toISOString(),
  });
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

it('troca a senha do perfil exigindo a senha atual e limpa os campos após sucesso', async () => {
  await renderAsync(<ResetPasswordScreen />);
  const user = userEvent.setup();
  await user.press(screen.getByRole('button', { name: 'Mostrar senha atual' }));
  expect(screen.getByLabelText('Senha atual')).toHaveProp(
    'secureTextEntry',
    false,
  );
  await user.press(screen.getByRole('button', { name: 'Ocultar senha atual' }));
  expect(screen.getByLabelText('Senha atual')).toHaveProp(
    'secureTextEntry',
    true,
  );
  fireEvent.changeText(screen.getByLabelText('Nova senha'), 'Password1');
  fireEvent.changeText(screen.getByLabelText('Confirmar senha'), 'Password1');
  await user.press(screen.getByRole('button', { name: 'Salvar' }));
  expect(authService.changePassword).not.toHaveBeenCalled();
  expect(screen.getByText('Digite sua senha atual.')).toBeOnTheScreen();
  fireEvent.changeText(screen.getByLabelText('Senha atual'), 'SenhaAtual123');
  await user.press(screen.getByRole('button', { name: 'Salvar' }));
  expect(authService.changePassword).toHaveBeenCalledWith({
    currentPassword: 'SenhaAtual123',
    newPassword: 'Password1',
  });
  expect(await screen.findByText('Sucesso !')).toBeOnTheScreen();
  expect(screen.getByLabelText('Senha atual')).toHaveDisplayValue('');
  expect(screen.getByLabelText('Nova senha')).toHaveDisplayValue('');
  expect(logout).not.toHaveBeenCalled();
  await user.press(screen.getByRole('button', { name: 'Fechar' }));
  expect(logout).toHaveBeenCalledTimes(1);
  expect(router.replace).toHaveBeenCalledWith('/(auth)/Login');
});

it('mantém o modal se o logout falhar e também desloga ao fechar pelo Android', async () => {
  logout.mockRejectedValueOnce(new Error('Falha ao limpar sessão'));
  await renderAsync(<ResetPasswordScreen />);
  fireEvent.changeText(screen.getByLabelText('Senha atual'), 'Atual123');
  fireEvent.changeText(screen.getByLabelText('Nova senha'), 'Password1');
  fireEvent.changeText(screen.getByLabelText('Confirmar senha'), 'Password1');
  const user = userEvent.setup();
  await user.press(screen.getByRole('button', { name: 'Salvar' }));
  await user.press(screen.getByRole('button', { name: 'Fechar' }));
  expect(
    await screen.findByText(/Não foi possível encerrar a sessão/),
  ).toBeOnTheScreen();
  expect(screen.getByText('Sucesso !')).toBeOnTheScreen();
  await act(async () => {
    fireEvent(screen.UNSAFE_getByType(Modal), 'requestClose');
  });
  expect(logout).toHaveBeenCalledTimes(2);
  expect(router.replace).toHaveBeenCalledWith('/(auth)/Login');
});

it('preserva os campos e mostra a falha ao trocar a senha', async () => {
  jest
    .mocked(authService.changePassword)
    .mockRejectedValue(new Error('Senha atual incorreta.'));
  await renderAsync(<ResetPasswordScreen />);
  fireEvent.changeText(screen.getByLabelText('Senha atual'), 'Errada123');
  fireEvent.changeText(screen.getByLabelText('Nova senha'), 'Password1');
  fireEvent.changeText(screen.getByLabelText('Confirmar senha'), 'Password1');
  await userEvent.setup().press(screen.getByRole('button', { name: 'Salvar' }));
  expect(await screen.findByText('Senha atual incorreta.')).toBeOnTheScreen();
  expect(screen.getByLabelText('Senha atual')).toHaveDisplayValue('Errada123');
  expect(screen.queryByText('Sucesso !')).not.toBeOnTheScreen();
});
