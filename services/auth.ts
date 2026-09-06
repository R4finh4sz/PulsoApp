import api from '@/services/api';
import { LoginForm } from '@/validation/Login.validation';

type VerifyCodePayload = {
  email: string;
  code: string;
  challengeId: string;
};

type ResendCodePayload = Pick<VerifyCodePayload, 'email' | 'challengeId'>;

export const authService = {
  login: (payload: LoginForm) => api.post('/auth/login', payload),
  verifyCode: (payload: VerifyCodePayload) =>
    api.post('/auth/2fa/verify', payload),
  resendCode: (payload: ResendCodePayload) =>
    api.post('/auth/2fa/resend', payload),
  fetchUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
};
