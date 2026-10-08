import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { PropsWithChildren } from 'react';
import { Platform } from 'react-native';

import { AuthProvider, useAuth } from '@/contexts/Auth/useAuth';
import api from '@/services/api';
import { authService } from '@/services/auth';
import { useOTPStore } from '@/store/otpStore';

jest.mock('@/services/mock', () => ({ isMockEnabled: false }));
jest.mock('@/services/auth', () => ({
  authService: {
    login: jest.fn(),
    fetchUser: jest.fn(),
    verify: jest.fn(),
    resend: jest.fn(),
    logout: jest.fn(),
  },
}));
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const student = { id: 1, role: 'STUDENT', fullName: 'Ana Silva' };
const session = { accessToken: 'token', expiresAt: '2099-01-01T00:00:00Z' };
const response = {
  ...session,
  twoFactorRequired: false,
  codeExpiresAt: 'expires',
  resendAvailableAt: 'resend',
  user: { role: 'STUDENT', termsAccepted: true },
};
const form = { email: ' ana@pulso.app ', password: 'secret', rememberMe: true };

const mount = (ready = true) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>
      <AuthProvider isAppReady={ready}>{children}</AuthProvider>
    </QueryClientProvider>
  );
  return { ...renderHook(useAuth, { wrapper }), client };
};

beforeEach(() => {
  jest.mocked(SecureStore.getItemAsync).mockReset().mockResolvedValue(null);
  jest.mocked(SecureStore.setItemAsync).mockReset().mockResolvedValue();
  jest.mocked(SecureStore.deleteItemAsync).mockReset().mockResolvedValue();
  jest
    .mocked(authService.login)
    .mockReset()
    .mockResolvedValue(response as never);
  jest
    .mocked(authService.fetchUser)
    .mockReset()
    .mockResolvedValue(student as never);
  jest.mocked(authService.verify).mockReset().mockResolvedValue();
  jest.mocked(authService.resend).mockReset().mockResolvedValue({
    twoFactorRequired: true,
    codeExpiresAt: 'new-expiry',
    resendAvailableAt: 'new-resend',
  });
  jest.mocked(authService.logout).mockReset().mockResolvedValue();
  useOTPStore.getState().clearOTPData();
});
afterEach(() => {
  jest.restoreAllMocks();
  delete api.defaults.headers.common.Authorization;
});

it('aguarda o app ficar pronto antes de restaurar', () => {
  const { result } = mount(false);
  expect(result.current.loading).toBe(true);
  expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
});

it('restaura token válido e remove credenciais legadas', async () => {
  jest
    .mocked(SecureStore.getItemAsync)
    .mockResolvedValue(JSON.stringify(session));
  const { result } = mount();
  await waitFor(() => expect(result.current.user).toEqual(student));
  expect(api.defaults.headers.common.Authorization).toBe('Bearer token');
  expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
    'studentCredentials',
  );
});

it.each([
  'invalid-json',
  'null',
  '{}',
  JSON.stringify({ ...session, expiresAt: '2000-01-01' }),
  JSON.stringify({ ...session, accessToken: '' }),
  JSON.stringify({ ...session, expiresAt: 'invalid' }),
])('descarta sessão corrompida ou expirada (%#)', async stored => {
  jest.mocked(SecureStore.getItemAsync).mockResolvedValue(stored);
  const { result } = mount();
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.user).toBeNull();
  expect(authService.fetchUser).not.toHaveBeenCalled();
  expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
    'studentTokenSession',
  );
});

it('permite tentar novamente após falha de conexão', async () => {
  jest
    .mocked(SecureStore.getItemAsync)
    .mockResolvedValue(JSON.stringify(session));
  jest
    .mocked(authService.fetchUser)
    .mockRejectedValueOnce(new Error('Offline'));
  const { result } = mount();
  await waitFor(() => expect(result.current.restoreError).toMatch(/conexão/));
  act(() => result.current.retryRestore());
  await waitFor(() => expect(result.current.user).toEqual(student));
  expect(result.current.restoreError).toBeNull();
});

it.each([401, 403])(
  'remove a sessão quando restauração recebe %s',
  async status => {
    jest
      .mocked(SecureStore.getItemAsync)
      .mockResolvedValue(JSON.stringify(session));
    jest
      .mocked(authService.fetchUser)
      .mockRejectedValue({ isAxiosError: true, response: { status } });
    const { result } = mount();
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.restoreError).toBeNull();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      'studentTokenSession',
    );
  },
);

it.each([true, false])(
  'faz login sem 2FA e respeita Manter conectado (%s)',
  async rememberMe => {
    const { result, client } = mount();
    await waitFor(() => expect(result.current.loading).toBe(false));
    client.setQueryData(['old'], 'old-data');
    await act(async () => result.current.login({ ...form, rememberMe }));
    expect(result.current.user).toEqual(student);
    expect(client.getQueryData(['old'])).toBeUndefined();
    expect(api.defaults.headers.common.Authorization).toBe('Bearer token');
    if (rememberMe) {
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'studentTokenSession',
        JSON.stringify(session),
      );
    } else {
      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    }
  },
);

it('mantém o acesso pendente até confirmar o código e permite reenvio', async () => {
  jest
    .mocked(authService.login)
    .mockResolvedValue({ ...response, twoFactorRequired: true } as never);
  const { result } = mount();
  await waitFor(() => expect(result.current.loading).toBe(false));
  await act(async () => result.current.login(form));
  expect(result.current.user).toBeNull();
  expect(router.replace).toHaveBeenCalledWith('/(auth)/2Auth');
  expect(useOTPStore.getState().otpData?.email).toBe('ana@pulso.app');
  await act(async () => result.current.resendOTPCode());
  expect(useOTPStore.getState().otpData?.codeExpiresAt).toBe('new-expiry');
  await act(async () => result.current.completeLogin({ code: '012345' }));
  expect(authService.verify).toHaveBeenCalledWith('012345');
  expect(result.current.user).toEqual(student);
  expect(useOTPStore.getState().otpData).toBeNull();
});

it('não verifica novamente quando o perfil falha após confirmar 2FA', async () => {
  jest
    .mocked(authService.login)
    .mockResolvedValue({ ...response, twoFactorRequired: true } as never);
  const { result } = mount();
  await waitFor(() => expect(result.current.loading).toBe(false));
  await act(async () => result.current.login(form));
  jest
    .mocked(authService.fetchUser)
    .mockRejectedValueOnce(new Error('Offline'));
  await act(async () => {
    await expect(
      result.current.completeLogin({ code: '123456' }),
    ).rejects.toThrow('Offline');
  });
  await act(async () => result.current.completeLogin({ code: '123456' }));
  expect(authService.verify).toHaveBeenCalledTimes(1);
});

it('rejeita confirmação e reenvio sem login pendente', async () => {
  const { result } = mount();
  await waitFor(() => expect(result.current.loading).toBe(false));
  await expect(
    result.current.completeLogin({ code: '123456' }),
  ).rejects.toThrow('sessão expirou');
  await expect(result.current.resendOTPCode()).rejects.toThrow(
    'Entre novamente',
  );
});

it('rejeita contas de professor e remove o token', async () => {
  jest
    .mocked(authService.login)
    .mockResolvedValue({ ...response, user: { role: 'TEACHER' } } as never);
  const { result } = mount();
  await waitFor(() => expect(result.current.loading).toBe(false));
  await act(async () => {
    await expect(result.current.login(form)).rejects.toThrow('conta de aluno');
  });
  expect(authService.logout).toHaveBeenCalled();
  expect(api.defaults.headers.common.Authorization).toBeUndefined();
});

it('limpa usuário, token e cache mesmo quando o logout remoto falha', async () => {
  const { result } = mount();
  await waitFor(() => expect(result.current.loading).toBe(false));
  await act(async () => result.current.login(form));
  jest.mocked(authService.logout).mockRejectedValue(new Error('Offline'));
  await act(async () => {
    await expect(result.current.logout()).rejects.toThrow('Offline');
  });
  expect(result.current.user).toBeNull();
  expect(api.defaults.headers.common.Authorization).toBeUndefined();
});

it('restaura e encerra sessão na plataforma web', async () => {
  jest.replaceProperty(Platform, 'OS', 'web');
  const storage = {
    getItem: jest.fn(() => JSON.stringify(session)),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  };
  Object.defineProperty(globalThis, 'sessionStorage', {
    value: storage,
    configurable: true,
  });
  const { result } = mount();
  await waitFor(() => expect(result.current.user).toEqual(student));
  await act(async () => result.current.login(form));
  expect(storage.setItem).toHaveBeenCalledWith(
    'studentTokenSession',
    JSON.stringify(session),
  );
  await act(async () => result.current.logout());
  expect(storage.removeItem).toHaveBeenCalledWith('studentTokenSession');
  expect(result.current.user).toBeNull();
  delete (globalThis as { sessionStorage?: unknown }).sessionStorage;
});
