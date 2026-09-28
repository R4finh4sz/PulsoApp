import { TUser } from '@/interfaces/user';
import api from '@/services/api';
import { isMockEnabled, mockUser } from '@/services/mock';
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
  login: async ({ email, password }: LoginForm): Promise<LoginResponse> => {
    if (isMockEnabled) {
      return {
        accessToken: 'mock-student-token',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        twoFactorRequired: false,
        codeExpiresAt: '',
        resendAvailableAt: '',
        user: { role: mockUser.role, termsAccepted: true },
      };
    }
    return (
      await api.post<LoginResponse>('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      })
    ).data;
  },
  fetchUser: async () => {
    if (isMockEnabled) {
      return { ...mockUser };
    }
    const { data } = await api.get<TUser>('/me');
    if (data.role !== 'STUDENT') {
      throw new Error(
        'Este aplicativo é destinado aos alunos. Use uma conta de aluno.',
      );
    }
    return data;
  },
  verify: async (code: string) => {
    if (isMockEnabled) {
      return;
    }
    await api.post('/auth/2fa/verify', { code });
  },
  resend: async (): Promise<TwoFactorResponse> => {
    if (isMockEnabled) {
      return {
        twoFactorRequired: false,
        codeExpiresAt: new Date(Date.now() + 300000).toISOString(),
        resendAvailableAt: new Date(Date.now() + 60000).toISOString(),
      };
    }
    return (await api.post<TwoFactorResponse>('/auth/2fa/resend')).data;
  },
  logout: async () => {
    if (isMockEnabled) {
      return;
    }
    await api.post('/auth/logout');
  },
};
