import { Text, View } from 'react-native';

import Pressable from '@/components/ui/Pressable';

type Props = {
  onResend: () => void;
  disabled?: boolean;
};

export const TwoAuthResend = ({ onResend, disabled = false }: Props) => (
  <View className="min-h-[140px] flex-1 flex-row items-center justify-center gap-1">
    <Text className="font-poppins text-sm text-[#616161]">
      Não recebeu o código?
    </Text>

    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={onResend}
    >
      <Text
        className={`font-poppins_bold text-sm ${disabled ? 'text-neutral-40' : 'text-[#009BB9]'}`}
      >
        Reenviar
      </Text>
    </Pressable>
  </View>
);
