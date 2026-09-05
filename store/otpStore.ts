import { create } from 'zustand';

export type OTPData = {
  email: string;
  challengeId: string;
};

type OTPStore = {
  otpData: OTPData | null;
  setOTPData: (data: OTPData) => void;
  clearOTPData: () => void;
};

export const useOTPStore = create<OTPStore>(set => ({
  otpData: null,
  setOTPData: otpData => set({ otpData }),
  clearOTPData: () => set({ otpData: null }),
}));
