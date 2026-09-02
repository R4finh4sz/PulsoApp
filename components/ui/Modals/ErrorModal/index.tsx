import { useErrorModal } from '@/store/errorModalStore';

import ModalBackdrop from '../ModalBackdrop';

const ErrorModal = () => {
  const { modal, closeErrorModal } = useErrorModal();

  if (!modal) {
    return null;
  }

  const handleClose = () => {
    modal.onClose?.();
    closeErrorModal();
  };

  return (
    <ModalBackdrop
      showButton
      visible
      buttonText={modal.buttonText || 'Entendi'}
      message={modal.message || 'Ocorreu um erro inesperado'}
      title={modal.title || 'Erro'}
      variant="error"
      onClose={handleClose}
    />
  );
};

export default ErrorModal;
