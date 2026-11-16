import { PropsWithChildren, useState } from 'react';
import { Modal } from 'react-native';

import ModalBackdrop from '@/components/ui/Modals/ModalBackdrop';
import useAuth from '@/contexts/Auth/useAuth';
import { getAccountDeletionDate } from '@/utils/graduation';

export const GraduationGate = ({ children }: PropsWithChildren) => {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (user?.status !== 'GRADUATED' || dismissed) {
    return children;
  }

  const deletionDate = getAccountDeletionDate(user.graduatedAt);
  const message = deletionDate
    ? `Sua conta será excluída em 30 dias a partir da data da deliberação, ou seja, em ${deletionDate.toLocaleDateString('pt-BR')}.`
    : 'Sua conta será excluída em 30 dias a partir da data da deliberação.';

  return (
    <>
      {children}

      <Modal
        transparent
        visible
        animationType="fade"
        onRequestClose={() => setDismissed(true)}
      >
        <ModalBackdrop
          buttons={[{ text: 'Entendi', onPress: () => setDismissed(true) }]}
          message={`Você concluiu sua jornada e agora é formado(a). Desejamos muito sucesso no seu futuro!\n${message}`}
          title="Parabéns, você se formou! 🎓"
          variant="success"
          onClose={() => setDismissed(true)}
        />
      </Modal>
    </>
  );
};
