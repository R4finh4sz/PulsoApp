import { Control } from 'react-hook-form';
import { Text, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';

import Checkbox from '@/components/ui/Checkbox';
import Pressable from '@/components/ui/Pressable';
import { LoginForm } from '@/validation/Login.validation';

type Props = {
  control: Control<LoginForm>;
};

export const LoginActions = ({ control }: Props) => {
  return (
    <Animated.View
      className="mb-4 mt-[-12px] w-full flex-row items-center justify-between"
      layout={LinearTransition}
    >
      <View className="flex-row items-center">
        <Checkbox control={control} name="rememberMe">
          <Text className="font-poppins_regular ml-[-2] mr-4 mt-1 text-sm text-neutral-80">
            Manter conectado
          </Text>
        </Checkbox>
      </View>

      <Pressable>
        <Text className="font-poppins_regular mt-1 text-sm text-primary-100">
          Esqueceu a senha?
        </Text>
      </Pressable>
    </Animated.View>
  );
};
