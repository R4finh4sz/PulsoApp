import { create } from 'zustand';

import { DefaultModalProps } from '@/components/ui/DefaultModal';

type Store = {
  modal: DefaultModalProps | null;
  openModal: (props: DefaultModalProps) => void;
  closeModal: () => void;
};

export const useDefaultModal = create<Store>(set => ({
  modal: null,
  openModal: props => set({ modal: props }),
  closeModal: () => set({ modal: null }),
}));
