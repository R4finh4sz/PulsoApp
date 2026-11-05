import { router } from 'expo-router';
import { View } from 'react-native';

import logo from '@/assets/images/LogoImageBlueAndYellow.png';
import Image from '@/components/ui/Image';
import { NotificationsButton } from '@/components/ui/NotificationsButton';
import Pressable from '@/components/ui/Pressable';
import { StudentAvatar } from '@/components/ui/StudentAvatar';

type Props = { onProfile?: () => void };

export const HomeHeader = ({ onProfile }: Props) => (
  <View
    className="flex-row items-center justify-between"
    style={{ marginBottom: 32 }}
  >
    <View style={{ flex: 1, paddingRight: 16 }}>
      <Image
        withoutBackground
        accessibilityLabel="PulsoEscolar"
        contentFit="contain"
        source={logo}
        style={{ width: 160, maxWidth: '100%', height: 54, marginBottom: 3 }}
      />
    </View>

    <NotificationsButton />

    <Pressable
      accessibilityLabel="Abrir perfil"
      accessibilityRole="button"
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#0095B3',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onPress={onProfile ?? (() => router.push('/(main)/Profile'))}
    >
      <StudentAvatar size={44} />
    </Pressable>
  </View>
);
