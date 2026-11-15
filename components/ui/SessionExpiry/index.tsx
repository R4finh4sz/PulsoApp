import { useEffect, useRef, useState } from 'react';
import { AppState, View } from 'react-native';
import ModalBackdrop from '@/components/ui/ModalBackdrop';

export default function SessionExpiry({ expiresAt, onExpire }: { expiresAt: string; onExpire: () => void }) {
  const [warning, setWarning] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const expire = useRef(onExpire);
  expire.current = onExpire;
  useEffect(() => {
    const check = () => {
      const remaining = Date.parse(expiresAt) - Date.now();
      if (!(remaining > 0)) {
        expire.current();
        setWarning(false);
      } else {
        setWarning(remaining <= 60_000);
      }
    };
    const remaining = Date.parse(expiresAt) - Date.now();
    check();
    const warningTimer = setTimeout(check, Math.min(Math.max(0, remaining - 60_000), 2147483647));
    const expiryTimer = setTimeout(check, Math.min(Math.max(0, remaining), 2147483647));
    const listener = AppState.addEventListener('change', state => { if (state === 'active') check(); });
    return () => {
      clearTimeout(warningTimer);
      clearTimeout(expiryTimer);
      listener.remove();
    };
  }, [expiresAt]);
  if (!warning || dismissed) return null;
  return (
    <View accessibilityViewIsModal className="absolute inset-0 z-[9999]">
      <ModalBackdrop
        variant="warning"
        title="Sua sessão está terminando"
        message="Sua sessão termina em até 1 minuto. Salve o que estiver fazendo. Se ela expirar, entre novamente para continuar."
        showButton
        buttonText="Entendi"
        onClose={() => setDismissed(true)}
      />
    </View>
  );
}
