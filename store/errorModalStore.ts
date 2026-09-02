import { create } from 'zustand';

export type ErrorModalProps = {
  title?: string;
  message?: string;
  buttonText?: string;
  onClose?: () => void;
};

type Store = {
  modal: ErrorModalProps | null;
  openErrorModal: (props: ErrorModalProps) => void;
  closeErrorModal: () => void;
};

export const useErrorModal = create<Store>(set => ({
  modal: null,
  openErrorModal: (props: any) => set({ modal: props }),
  closeErrorModal: () => set({ modal: null }),
}));
