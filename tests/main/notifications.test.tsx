import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  fireEventAsync,
  renderAsync,
  screen,
  userEvent,
  waitFor,
} from '@testing-library/react-native';
import { router } from 'expo-router';

import Notifications from '@/app/(main)/Notifications';
import { NotificationsButton } from '@/components/ui/NotificationsButton';
import useAuth from '@/contexts/Auth/useAuth';
import {
  notificationService,
  StudentNotification,
} from '@/services/notifications';

jest.mock('@/contexts/Auth/useAuth', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('@/services/notifications', () => ({
  notificationService: { list: jest.fn(), markRead: jest.fn() },
}));
const notification = {
  id: 2,
  title: 'Nova matéria',
  message: 'Você recebeu um convite.',
  type: 'SUBJECT_INVITATION',
  read: false,
} as StudentNotification;
const mount = async () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  await renderAsync(
    <QueryClientProvider client={client}>
      <Notifications />
    </QueryClientProvider>,
  );
  return client;
};
beforeEach(() => {
  jest.useFakeTimers();
  jest.mocked(useAuth).mockReturnValue({ user: { id: 1 } } as never);
  jest
    .mocked(notificationService.list)
    .mockReset()
    .mockResolvedValue([notification]);
  jest
    .mocked(notificationService.markRead)
    .mockReset()
    .mockResolvedValue(undefined);
});
afterEach(() => jest.useRealTimers());

it('abre a tela pelo botão circular do cabeçalho', async () => {
  await renderAsync(<NotificationsButton />);
  await userEvent
    .setup()
    .press(screen.getByRole('button', { name: 'Abrir notificações' }));
  expect(router.push).toHaveBeenCalledWith('/(main)/Notifications');
});

it('exibe mensagem e só marca como lida após confirmação do servidor', async () => {
  const client = await mount();
  await screen.findByText('Nova matéria');
  expect(screen.getByText(notification.message)).toBeOnTheScreen();
  await userEvent
    .setup()
    .press(screen.getByRole('button', { name: /Nova matéria/ }));
  expect(notificationService.markRead).toHaveBeenCalledWith(2);
  await waitFor(() =>
    expect(screen.queryByText('Não lida')).not.toBeOnTheScreen(),
  );
  expect(notificationService.markRead).toHaveBeenCalledWith(2);
  expect(client.getQueryData(['student-notifications', 1])).toEqual([
    { ...notification, read: true },
  ]);
});

it('mantém não lida e mostra erro quando a marcação falha', async () => {
  jest
    .mocked(notificationService.markRead)
    .mockRejectedValue(new Error('Sem conexão'));
  await mount();
  await screen.findByText('Nova matéria');
  await userEvent
    .setup()
    .press(screen.getByRole('button', { name: /Nova matéria/ }));
  expect(await screen.findByText('Sem conexão')).toBeOnTheScreen();
  expect(screen.getByText('Não lida')).toBeOnTheScreen();
});

it('exibe estado vazio', async () => {
  jest.mocked(notificationService.list).mockResolvedValue([]);
  await mount();
  expect(
    await screen.findByText('Nenhuma notificação por enquanto'),
  ).toBeOnTheScreen();
});

it('permite tentar novamente quando a lista falha', async () => {
  jest.mocked(notificationService.list).mockRejectedValue(new Error('Offline'));
  await mount();
  await screen.findByText('Não foi possível carregar suas notificações.');
  jest.mocked(notificationService.list).mockResolvedValue([notification]);
  await fireEventAsync.press(
    screen.getByRole('button', { name: 'Tentar novamente' }),
  );
  expect(await screen.findByText('Nova matéria')).toBeOnTheScreen();
});
