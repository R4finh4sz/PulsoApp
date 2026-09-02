import { createContext, PropsWithChildren, useContext, useState } from 'react';

import { DefaultModalProps } from '@/components/ui/DefaultModal';

interface ProviderProps {
  modal: DefaultModalProps | null;
  openModal: (props: DefaultModalProps) => void;
  closeModal: () => void;
}

const DefaultModalContext = createContext({} as ProviderProps);

export const DefaultModalProvider = ({ children }: PropsWithChildren) => {
  const [modal, setModal] = useState<DefaultModalProps | null>(null);

  const openModal = (props: DefaultModalProps) => {
    setModal(props);
  };

  const closeModal = () => {
    setModal(null);
  };

  return (
    <DefaultModalContext.Provider
      value={{
        modal,
        openModal,
        closeModal,
      }}
    >
      {children}
    </DefaultModalContext.Provider>
  );
};

const useDefaultModal = () => useContext(DefaultModalContext);

export default useDefaultModal;
