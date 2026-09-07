import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Text, View } from 'react-native';

import Pressable from '@/components/ui/Pressable';

type Props = {
  onPress?: () => void;
  label?: string;
};

export const BackButton = ({
  onPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/Login');
    }
  },
  label = 'Voltar',
}: Props) => (
  <Pressable
    accessibilityLabel={label}
    accessibilityRole="button"
    className="flex-row items-center gap-2 self-start"
    hitSlop={8}
    onPress={onPress}
  >
    <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#0095B3]">
      <ArrowLeft color="#FFFFFF" size={22} />
    </View>

    <Text className="font-poppins_medium text-sm text-black">{label}</Text>
  </Pressable>
);
