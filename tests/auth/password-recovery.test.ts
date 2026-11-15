import axios from 'axios';

import { passwordRecoveryService } from '@/services/passwordRecovery';

jest.mock('axios', () => ({
  __esModule: true,
  default: { create: jest.fn(() => ({ post: jest.fn() })) },
}));
jest.mock('@/services/api', () => ({ baseURL: 'http://localhost:8080/api' }));
jest.mock('@/services/mock', () => ({ isMockEnabled: false }));
const client = jest.mocked(axios.create).mock.results[0].value;

beforeEach(() => client.post.mockReset());

it('solicita e valida o código e envia a nova senha com o token recebido', async () => {
  client.post
    .mockResolvedValueOnce({ data: {} })
    .mockResolvedValueOnce({
      data: { resetToken: 'token', expiresAt: '2026-11-02T15:00:00Z' },
    })
    .mockResolvedValueOnce({});
  await passwordRecoveryService.request('ana@pulso.app');
  const verification = await passwordRecoveryService.verify(
    'ana@pulso.app',
    '012345',
  );
  await passwordRecoveryService.reset({
    email: 'ana@pulso.app',
    resetToken: verification.resetToken,
    newPassword: 'Password1',
    confirmPassword: 'Password1',
  });
  expect(client.post).toHaveBeenNthCalledWith(
    1,
    '/auth/password-recovery/request',
    { email: 'ana@pulso.app' },
  );
  expect(client.post).toHaveBeenNthCalledWith(
    2,
    '/auth/password-recovery/verify',
    { email: 'ana@pulso.app', code: '012345' },
  );
  expect(client.post).toHaveBeenNthCalledWith(
    3,
    '/auth/password-recovery/reset',
    {
      email: 'ana@pulso.app',
      resetToken: 'token',
      newPassword: 'Password1',
      confirmPassword: 'Password1',
    },
  );
});

it('propaga erros do backend sem simular sucesso', async () => {
  const error = new Error('Código inválido');
  client.post.mockRejectedValue(error);
  await expect(passwordRecoveryService.request('ana@pulso.app')).rejects.toBe(
    error,
  );
  await expect(
    passwordRecoveryService.verify('ana@pulso.app', '012345'),
  ).rejects.toBe(error);
  await expect(
    passwordRecoveryService.reset({
      email: 'ana@pulso.app',
      resetToken: 'token',
      newPassword: 'Password1',
      confirmPassword: 'Password1',
    }),
  ).rejects.toBe(error);
});
