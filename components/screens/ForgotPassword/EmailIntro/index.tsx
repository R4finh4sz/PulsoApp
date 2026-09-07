import { Text, View } from 'react-native';

export const EmailIntro = () => (
  <View style={{ alignItems: 'center', marginBottom: 52 }}>
    <Text className="font-poppins_bold text-xl" style={{ color: '#0095B3' }}>
      Esqueceu a senha
    </Text>

    <Text
      className="text-center font-poppins text-sm text-neutral-60"
      style={{ maxWidth: 300 }}
    >
      Não se preocupe. Informe seu e-mail e enviaremos as instruções para
      redefinir sua senha.
    </Text>
  </View>
);
