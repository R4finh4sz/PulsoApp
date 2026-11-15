import api from '@/services/api';
import { notificationService } from '@/services/notifications';

jest.mock('@/services/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), patch: jest.fn() },
}));
jest.mock('@/services/mock', () => ({ isMockEnabled: false }));

it('consulta notificações e marca leitura usando o cliente autenticado', async () => {
  const items = [{ id: 2, title: 'Aviso', read: false }];
  const signal = new AbortController().signal;
  jest.mocked(api.get).mockResolvedValue({ data: items });
  await expect(notificationService.list(signal)).resolves.toEqual(items);
  expect(api.get).toHaveBeenCalledWith('/notifications', { signal });
  await notificationService.markRead(2);
  expect(api.patch).toHaveBeenCalledWith('/notifications/2/read');
});

it('propaga falhas de leitura', async () => {
  const error = new Error('Offline');
  jest.mocked(api.patch).mockRejectedValueOnce(error);
  await expect(notificationService.markRead(2)).rejects.toBe(error);
});
