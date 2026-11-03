import { create } from 'zustand';

type Recovery = {
  email: string;
  requestedAt: number;
  resetToken?: string;
  expiresAt?: string;
};

export const usePasswordRecoveryStore = create<{
  recovery: Recovery | null;
  setRecovery: (recovery: Recovery | null) => void;
}>(set => ({
  recovery: null,
  setRecovery: recovery => set({ recovery }),
}));
