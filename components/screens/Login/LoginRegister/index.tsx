import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

export const LoginRegister = () => {
  const router = useRouter();

  return (
    <View className="mb-4 mt-8 w-full flex-row items-center justify-center">
      <Text className="font-poppins_regular text-sm text-primary-100">
        Não tem uma conta?
      </Text>

      <Text
        accessibilityRole="link"
        className="ml-1 font-poppins_semibold text-sm text-primary-100"
        onPress={() => router.push('../Register')}
      >
        Cadastre-se
      </Text>
    </View>
  );
};
