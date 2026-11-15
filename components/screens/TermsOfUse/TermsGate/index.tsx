import { Redirect, router, usePathname } from 'expo-router';
import { PropsWithChildren } from 'react';
import { Modal } from 'react-native';

import ModalBackdrop from '@/components/ui/Modals/ModalBackdrop';
import useAuth from '@/contexts/Auth/useAuth';

export const TermsGate = ({ children }: PropsWithChildren) => {
  const { user } = useAuth();
  const pathname = usePathname();
  if (user?.termsAccepted === true || pathname === '/TermsOfUse') {
    return children;
  }
  if (pathname !== '/Home') {
    return <Redirect href="/(main)/Home" />;
  }
  return (
    <>
      {children}

      <Modal transparent visible animationType="fade" onRequestClose={() => {}}>
        <ModalBackdrop
          buttons={[
            {
              text: 'Ler os termos',
              onPress: () => router.push('/(main)/TermsOfUse'),
            },
          ]}
          message="Leia os termos e a Política de Privacidade e confirme sua concordância ou ciência para continuar."
          title="Aceite os termos para continuar"
          variant="info"
          onClose={() => {}}
        />
      </Modal>
    </>
  );
};
