import { create } from 'zustand';

import { getErrorMessage } from '@/utils/getErrorMessage';

export type ErrorModalProps = {
  title?: string;
  message?: string;
  buttonText?: string;
  onClose?: () => void;
};

type Store = {
  modal: ErrorModalProps | null;
  openErrorModal: (props: ErrorModalProps) => void;
  openErrorFromException: (error: unknown, props?: ErrorModalProps) => void;
  closeErrorModal: () => void;
};

export const useErrorModal = create<Store>(set => ({
  modal: null,
  openErrorModal: props => set({ modal: props }),
  openErrorFromException: (error, props = {}) =>
    set({
      modal: { ...props, message: getErrorMessage(error, props.message) },
    }),
  closeErrorModal: () => set({ modal: null }),
}));
