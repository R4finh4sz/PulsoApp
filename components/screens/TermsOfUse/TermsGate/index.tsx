import { Redirect, router, usePathname } from 'expo-router';
import { PropsWithChildren } from 'react';
import { Modal } from 'react-native';

import ModalBackdrop from '@/components/ui/Modals/ModalBackdrop';
import useAuth from '@/contexts/Auth/useAuth';

import { TermsAcceptance } from '../TermsAcceptance';

export const TermsGate = ({ children }: PropsWithChildren) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  if (user?.termsAccepted === true) {
    return children;
  }
  if (pathname === '/TermsOfUse') {
    return <TermsAcceptance />;
  }
  if (pathname !== '/Home') {
    return <Redirect href="/(main)/Home" />;
  }
  return (
    <Modal transparent visible animationType="fade" onRequestClose={() => {}}>
      <ModalBackdrop
        buttons={[
          {
            text: 'Ler os termos',
            onPress: () => router.push('/(main)/TermsOfUse'),
          },
          {
            text: 'Sair',
            wired: true,
            onPress: () => {
              logout();
            },
<<<<<<< Updated upstream
          ]}
          message="Os termos e a Política de Privacidade foram atualizados. Leia e confirme sua concordância ou ciência para continuar usando o app."
          title="Termos atualizados"
          variant="info"
          onClose={() => {}}
        />
      </Modal>
    </>
=======
          },
        ]}
        message="Os termos e a Política de Privacidade foram atualizados. Leia e confirme sua concordância ou ciência para continuar usando o app."
        title="Termos atualizados"
        variant="info"
        onClose={() => {}}
      />
    </Modal>
>>>>>>> Stashed changes
  );
};
