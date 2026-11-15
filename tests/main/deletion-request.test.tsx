import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderAsync, screen, userEvent } from '@testing-library/react-native';

import RequestDeletedAccount from '@/app/(main)/RequestDeletedAccount';
import { profileService } from '@/services/profile';

jest.mock('@/services/profile', () => ({
  profileService: { requestDeletion: jest.fn(), deletionRequests: jest.fn() },
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(profileService.deletionRequests).mockResolvedValue([]);
});

const mount = () =>
  renderAsync(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: { queries: { retry: false, gcTime: 0 } },
        })
      }
    >
      <RequestDeletedAccount />
    </QueryClientProvider>,
  );

it('valida as etapas e envia motivo e senha somente na confirmação final', async () => {
  jest.mocked(profileService.requestDeletion).mockResolvedValue();
  const user = userEvent.setup();
  await mount();
  await screen.findByText('Você ainda não possui solicitações de exclusão.');
  await user.press(screen.getByRole('button', { name: 'Excluir conta' }));
  await user.press(screen.getByRole('button', { name: 'Prosseguir' }));
  expect(screen.getByText('Informe o motivo da exclusão.')).toBeOnTheScreen();
  await user.type(screen.getByLabelText('Motivo'), 'Não utilizo mais.');
  await user.press(screen.getByRole('button', { name: 'Prosseguir' }));
  expect(profileService.requestDeletion).not.toHaveBeenCalled();
  await user.press(screen.getByRole('button', { name: 'Finalizar pedido' }));
  expect(screen.getByText('Digite sua senha atual.')).toBeOnTheScreen();
  await user.type(screen.getByLabelText('Senha'), 'senha-atual');
  await user.press(screen.getByRole('button', { name: 'Finalizar pedido' }));
  expect(profileService.requestDeletion).toHaveBeenCalledWith({
    reason: 'Não utilizo mais.',
    currentPassword: 'senha-atual',
  });
  expect(screen.getByText('Solicitação enviada')).toBeOnTheScreen();
});

it('mostra modal de erro quando o pedido é recusado', async () => {
  jest
    .mocked(profileService.requestDeletion)
    .mockRejectedValue(new Error('Senha incorreta'));
  const user = userEvent.setup();
  await mount();
  await screen.findByText('Você ainda não possui solicitações de exclusão.');
  await user.press(screen.getByRole('button', { name: 'Excluir conta' }));
  await user.type(screen.getByLabelText('Motivo'), 'Motivo');
  await user.press(screen.getByRole('button', { name: 'Prosseguir' }));
  await user.type(screen.getByLabelText('Senha'), 'senha');
  await user.press(screen.getByRole('button', { name: 'Finalizar pedido' }));
  expect(screen.getByText('Senha incorreta')).toBeOnTheScreen();
  await user.press(screen.getByRole('button', { name: 'Entendi' }));
  expect(screen.getByLabelText('Senha')).toHaveDisplayValue('');
});

it('lista solicitações existentes antes de abrir o motivo', async () => {
  jest.mocked(profileService.deletionRequests).mockResolvedValue([
    {
      id: 1,
      status: 'PENDING',
      requestedAt: '2026-11-05T12:00:00Z',
      reason: 'Não utilizo mais.',
      reviewReason: null,
    },
  ]);
  await mount();
  expect(await screen.findByText('Pendente')).toBeOnTheScreen();
  const button = screen.getByRole('button', { name: 'Excluir conta' });
  expect(button).toBeDisabled();
  await userEvent.setup().press(button);
  expect(screen.getByText('Não utilizo mais.')).toBeOnTheScreen();
  expect(screen.queryByLabelText('Motivo')).not.toBeOnTheScreen();
});

it('permite um novo pedido quando o anterior foi rejeitado', async () => {
  jest.mocked(profileService.deletionRequests).mockResolvedValue([
    {
      id: 1,
      status: 'REJECTED',
      requestedAt: '2026-11-05T12:00:00Z',
      reason: 'Motivo anterior',
      reviewReason: null,
    },
  ]);
  await mount();
  expect(await screen.findByText('Rejeitada')).toBeOnTheScreen();
  const button = screen.getByRole('button', { name: 'Excluir conta' });
  expect(button).toBeEnabled();
  await userEvent.setup().press(button);
  expect(screen.getByLabelText('Motivo')).toBeOnTheScreen();
});
