import { TUser } from '@/interfaces/user';
import api from '@/services/api';
import { LoginForm } from '@/validation/Login.validation';

export type TwoFactorResponse = {
  twoFactorRequired: boolean;
  codeExpiresAt: string;
  resendAvailableAt: string;
};
export type LoginResponse = TwoFactorResponse & {
  accessToken: string;
  expiresAt: string;
  user: { role: TUser['role']; termsAccepted: boolean };
};
export const authService = {
  login: async ({ email, password }: LoginForm) =>
    (
      await api.post<LoginResponse>('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      })
    ).data,
  fetchUser: async () => {
    const { data } = await api.get<TUser>('/me');
    if (data.role !== 'STUDENT') {
      throw new Error(
        'Este aplicativo é destinado aos alunos. Use uma conta de aluno.',
      );
    }
    return data;
  },
  verify: async (code: string) => {
    await api.post('/auth/2fa/verify', { code });
  },
  resend: async () =>
    (await api.post<TwoFactorResponse>('/auth/2fa/resend')).data,
  logout: async () => {
    await api.post('/auth/logout');
  },
};
