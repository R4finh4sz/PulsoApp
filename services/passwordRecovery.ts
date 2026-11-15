import axios from 'axios';

import { baseURL } from '@/services/api';
import { isMockEnabled } from '@/services/mock';

const publicApi = axios.create({ baseURL, timeout: 15000 });
export const passwordRecoveryService = {
  request: async (email: string) => {
    if (!isMockEnabled) {
      await publicApi.post('/auth/password-recovery/request', { email });
    }
  },
  verify: async (email: string, code: string) => {
    if (isMockEnabled) {
      return {
        resetToken: 'demo-reset-token',
        expiresAt: new Date(Date.now() + 600000).toISOString(),
      };
    }
    return (
      await publicApi.post<{ resetToken: string; expiresAt: string }>(
        '/auth/password-recovery/verify',
        { email, code },
      )
    ).data;
  },
  reset: async (input: {
    email: string;
    resetToken: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (!isMockEnabled) {
      await publicApi.post('/auth/password-recovery/reset', input);
    }
  },
};
