import { useOTPStore } from '@/store/otpStore';

beforeEach(() => useOTPStore.getState().clearOTPData());

it('substitui o desafio OTP e limpa os dados ao encerrar o fluxo', () => {
  const initial = {
    email: 'student@pulso.app',
    codeExpiresAt: 'first',
    resendAvailableAt: 'first',
  };
  useOTPStore.getState().setOTPData(initial);
  expect(useOTPStore.getState().otpData).toEqual(initial);
  const renewed = { ...initial, codeExpiresAt: 'renewed' };
  useOTPStore.getState().setOTPData(renewed);
  expect(useOTPStore.getState().otpData).toEqual(renewed);
  useOTPStore.getState().clearOTPData();
  expect(useOTPStore.getState().otpData).toBeNull();
});
