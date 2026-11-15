import { router } from 'expo-router';
import { X } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { BackArrowIcon } from '@/assets/icons';
import Pressable from '@/components/ui/Pressable';

type Props = {
  onPress?: () => void;
  label?: string;
  variant?: 'back' | 'close';
  accessibilityLabel?: string;
};

export const BackButton = ({
  onPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/Login');
    }
  },
  variant = 'back',
  label = variant === 'close' ? 'Fechar' : 'Voltar',
  accessibilityLabel = label || (variant === 'close' ? 'Fechar' : 'Voltar'),
}: Props) => (
  <Pressable
    accessibilityLabel={accessibilityLabel}
    accessibilityRole="button"
    className="flex-row items-center gap-2 self-start"
    hitSlop={8}
    onPress={onPress}
  >
    <View
      className={`h-10 w-10 items-center justify-center rounded-xl ${variant === 'close' ? 'border border-[#99CCD7] bg-[#E0E8EA]' : 'bg-[#0095B3]'}`}
    >
      {variant === 'close' ? (
        <X color="#009DBD" size={22} />
      ) : (
        <BackArrowIcon />
      )}
    </View>

    {!!label && (
      <Text className="font-poppins_medium text-sm text-black">{label}</Text>
    )}
  </Pressable>
);
