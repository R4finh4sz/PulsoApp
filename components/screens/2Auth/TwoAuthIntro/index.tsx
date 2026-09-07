import { Text, View } from 'react-native';

type Props = { marginTop?: number };

export const TwoAuthIntro = ({ marginTop = 24 }: Props) => (
  <View className="items-center" style={{ marginTop, gap: 4 }}>
    <Text className="font-poppins_bold text-lg" style={{ color: '#009BB9' }}>
      Digite seu código
    </Text>

    <Text className="text-center font-poppins text-sm text-[#616161]">
      Insira o código que enviamos para o seu{'\n'}e-mail para continuar
    </Text>
  </View>
);
