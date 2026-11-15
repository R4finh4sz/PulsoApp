import { ShieldCheck } from 'lucide-react-native';
import { Text, View } from 'react-native';

export const ChangePasswordIntro = () => (
  <View className="mt-6 items-center">
    <View className="mb-3 h-[76px] w-[76px] items-center justify-center rounded-3xl bg-[#E7FAFD]">
      <ShieldCheck color="#0095B3" size={36} strokeWidth={1.7} />
    </View>

    <Text className="font-poppins_bold text-xl text-[#253041]">
      Recuperar senha
    </Text>

    <Text className="mb-5 mt-3 text-center font-poppins text-sm leading-5 text-[#647895]">
      Recupere o acesso à sua conta criando uma nova senha. Escolha uma senha
      forte, siga as orientações de segurança e evite utilizar informações
      fáceis de descobrir.
    </Text>
  </View>
);
