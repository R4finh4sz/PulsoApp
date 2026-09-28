import { useRouter } from 'expo-router';
import { Text } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';

export const LoginActions = () => {
  const router = useRouter();

  return (
    <Animated.View
      className="mb-4 mt-[-12px] w-full flex-row items-center justify-between"
      layout={LinearTransition}
    >
      <Text
        className="font-poppins_regular mt-1 text-sm text-primary-100"
        onPress={() => router.push('../ForgotPassword/EmailScreen')}
      >
        Esqueceu a senha?
      </Text>
    </Animated.View>
  );
};
