import { NotificationsButton } from '@/components/ui/NotificationsButton';
import { router } from 'expo-router';
import { Text, View } from 'react-native';

import Pressable from '@/components/ui/Pressable';
import { StudentAvatar } from '@/components/ui/StudentAvatar';

type Props = { onProfile?: () => void };

export const TeamsHeader = ({ onProfile }: Props) => (
  <View
    className="flex-row items-center justify-between"
    style={{ marginBottom: 46, gap: 12 }}
  >
    <Text
      className="font-poppins_bold text-xl"
      style={{ flex: 1, color: '#253044' }}
    >
      Minhas Matérias
    </Text>

    <NotificationsButton />
    <Pressable
      accessibilityLabel="Abrir perfil"
      accessibilityRole="button"
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#0095B3',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onPress={onProfile ?? (() => router.push('/(main)/Profile'))}
    >
      <StudentAvatar size={40} />
    </Pressable>
  </View>
);
