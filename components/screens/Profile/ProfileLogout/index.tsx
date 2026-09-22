import { LogOut } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Text, View } from 'react-native';

import Pressable from '@/components/ui/Pressable';
import useAuth from '@/contexts/Auth/useAuth';

export const ProfileLogout = () => {
  const { logout } = useAuth();
  const [notice, setNotice] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const handleLogout = async () => {
    setSigningOut(true);
    try {
      await logout();
    } catch {
      setNotice(
        'Não foi possível remover a sessão salva. Tente sair novamente.',
      );
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <View className="flex-1 justify-end pt-16">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: signingOut }}
        className="min-h-[50px] flex-row items-center justify-center gap-2 rounded-[14px] border border-[#FF575F] bg-[#FFF0F0] p-3.5"
        disabled={signingOut}
        onPress={handleLogout}
      >
        <LogOut color="#FF575F" size={20} strokeWidth={1.8} />

        <Text className="font-poppins_semibold text-sm text-[#FF575F]">
          {signingOut ? 'Saindo…' : 'Sair da conta'}
        </Text>
      </Pressable>

      <Modal
        transparent
        animationType="fade"
        visible={notice !== null}
        onRequestClose={() => setNotice(null)}
      >
        <View className="flex-1 items-center justify-center bg-black/40 p-6">
          <View
            accessibilityViewIsModal
            className="w-full max-w-[400px] rounded-[18px] bg-white p-6"
          >
            <Text className="mb-3 font-poppins_bold text-sm text-[#4B5563]">
              Conta
            </Text>

            <Text className="font-poppins_medium text-[13px] text-[#4B5563]">
              {notice}
            </Text>

            <Pressable
              accessibilityRole="button"
              className="mt-6 items-center rounded-[10px] bg-[#0095B3] p-3.5"
              onPress={() => setNotice(null)}
            >
              <Text className="font-poppins_semibold text-white">Entendi</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};
