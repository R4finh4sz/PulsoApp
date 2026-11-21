import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderAsync, screen } from '@testing-library/react-native';
import { usePathname } from 'expo-router';
import { Text } from 'react-native';

import { GuardianRenewalGate } from '@/components/screens/TermsOfUse/GuardianRenewalGate';
import { TermsGate } from '@/components/screens/TermsOfUse/TermsGate';
import useAuth from '@/contexts/Auth/useAuth';
import api from '@/services/api';
import { authService } from '@/services/auth';
import { termsService } from '@/services/terms';

jest.mock('@/contexts/Auth/useAuth', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('@/services/mock', () => ({
  isMockEnabled: true,
  mockUser: { id: 1, role: 'STUDENT' },
  mockTerms: { version: 'demo' },
}));
jest.mock('@/services/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));

it('mock inicia com aluno pendente e mostra o responsavel apenas depois do aceite', async () => {
  const login = await authService.login({
    email: 'aluno@teste.com',
    password: 'teste',
    rememberMe: false,
  });
  expect(login.user.termsAccepted).toBe(false);
  expect(await termsService.accepted()).toEqual([]);
  jest.mocked(usePathname).mockReturnValue('/Home');
  jest
    .mocked(useAuth)
    .mockReturnValue({ user: { id: 1, termsAccepted: false } } as never);
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  const content = (
    <QueryClientProvider client={client}>
      <TermsGate>
        <GuardianRenewalGate>
          <Text>Area liberada</Text>
        </GuardianRenewalGate>
      </TermsGate>
    </QueryClientProvider>
  );
  const view = await renderAsync(content);
  expect(screen.getByText('Termos atualizados')).toBeOnTheScreen();
  expect(
    screen.queryByText('Aceite do responsável pendente'),
  ).not.toBeOnTheScreen();
  jest
    .mocked(useAuth)
    .mockReturnValue({ user: { id: 1, termsAccepted: true } } as never);
  await view.rerenderAsync(
    <QueryClientProvider client={client}>
      <TermsGate>
        <GuardianRenewalGate>
          <Text>Area liberada</Text>
        </GuardianRenewalGate>
      </TermsGate>
    </QueryClientProvider>,
  );
  expect(screen.getByText('Aceite do responsável pendente')).toBeOnTheScreen();
  expect(screen.queryByText('Termos atualizados')).not.toBeOnTheScreen();
  expect(screen.queryByText('Area liberada')).not.toBeOnTheScreen();
  expect(screen.getByText('Enviar link')).toBeDisabled();
  expect(api.get).not.toHaveBeenCalled();
  expect(api.post).not.toHaveBeenCalled();
});

it('consulta automaticamente e libera o acesso quando o responsavel aceita', async () => {
  jest.useFakeTimers();
  jest.replaceProperty(
    jest.requireMock('@/services/mock'),
    'isMockEnabled',
    false,
  );
  jest
    .mocked(useAuth)
    .mockReturnValue({ user: { id: 2, termsAccepted: true } } as never);
  jest
    .mocked(api.get)
    .mockResolvedValueOnce({
      data: { required: true, sendsRemaining: 3, nextSendAt: null },
    })
    .mockResolvedValue({
      data: { required: false, sendsRemaining: 3, nextSendAt: null },
    });
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  try {
    await renderAsync(
      <QueryClientProvider client={client}>
        <GuardianRenewalGate>
          <Text>Area liberada</Text>
        </GuardianRenewalGate>
      </QueryClientProvider>,
    );
    expect(
      await screen.findByText('Aceite do responsável pendente'),
    ).toBeOnTheScreen();
    expect(screen.queryByText('Verificar aceite')).not.toBeOnTheScreen();
    expect(screen.getByText('Enviar link')).toBeOnTheScreen();
    expect(screen.getByText('Sair')).toBeOnTheScreen();
    await act(async () => {
      await jest.advanceTimersByTimeAsync(15_000);
    });
    expect(await screen.findByText('Area liberada')).toBeOnTheScreen();
    expect(api.get).toHaveBeenCalledTimes(2);
  } finally {
    client.clear();
    jest.restoreAllMocks();
    jest.useRealTimers();
  }
});
