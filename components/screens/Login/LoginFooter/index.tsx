import { Text, View } from 'react-native';

export const LoginFooter = () => {
  return (
    <View className="mt-[-10px] flex-row items-center justify-center gap-1">
      <Text className="font-roboto_regular text-sm text-neutral-100">
        Ainda não tem uma conta?
        <Text className="font-roboto_medium text-base text-primary-100">
          {' '}
          Cadastre-se
        </Text>
      </Text>
    </View>
  );
};
