import { Text, View } from 'react-native';

export const TwoAuthIntro = () => (
  <View className="items-center" style={{ marginTop: 24, gap: 2 }}>
    <Text className="font-poppins_bold text-xl" style={{ color: '#009BB9' }}>
      Digite seu código
    </Text>

    <Text className="text-center font-poppins text-sm text-neutral-60">
      Insira o código que enviamos para o seu{'\n'}e-mail para continuar
    </Text>
  </View>
);
