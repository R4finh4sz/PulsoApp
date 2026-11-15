import { NotificationsButton } from '@/components/ui/NotificationsButton';
import { router } from 'expo-router';
import { Text, View } from 'react-native';

import Pressable from '@/components/ui/Pressable';
import { StudentAvatar } from '@/components/ui/StudentAvatar';

export const ReportsHeader = () => (
  <View
    className="flex-row items-center justify-between"
    style={{ marginBottom: 40, gap: 12 }}
  >
    <Text
      accessibilityRole="header"
      className="font-poppins_bold text-xl"
      style={{ flex: 1, color: '#253044' }}
    >
      Meu desempenho
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
      onPress={() => router.push('/(main)/Profile')}
    >
      <StudentAvatar size={40} />
    </Pressable>
  </View>
);
