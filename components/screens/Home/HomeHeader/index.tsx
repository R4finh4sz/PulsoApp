import { UserRound } from 'lucide-react-native';
import { Text, View } from 'react-native';

import Pressable from '@/components/ui/Pressable';

type Props = { name: string; onProfile?: () => void };

export const HomeHeader = ({ name, onProfile }: Props) => (
  <View
    className="flex-row items-center justify-between"
    style={{ marginBottom: 32 }}
  >
    <View style={{ flex: 1, paddingRight: 16 }}>
      <Text
        className="font-poppins text-xs"
        style={{ color: '#70839D', marginBottom: 3 }}
      >
        Olá, bom dia 👋
      </Text>

      <Text className="font-poppins_bold text-lg" style={{ color: '#253044' }}>
        {name}
      </Text>
    </View>

    <Pressable
      accessibilityLabel="Abrir perfil"
      accessibilityRole="button"
      accessibilityState={{ disabled: !onProfile }}
      disabled={!onProfile}
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#0095B3',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onPress={onProfile}
    >
      <UserRound color="#FFFFFF" size={23} strokeWidth={1.7} />
    </Pressable>
  </View>
);
