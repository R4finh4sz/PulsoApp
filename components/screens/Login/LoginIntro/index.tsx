import { Text } from 'react-native';

export const LoginIntro = () => {
  return (
    <>
      <Text className="font-poppins_bold text-center text-[22px] text-primary-100">
        Seja bem-vindo!
      </Text>

      <Text className="font-poppins_regular text-center text-sm text-neutral-80">
        Faça login para continuar
      </Text>
    </>
  );
};
