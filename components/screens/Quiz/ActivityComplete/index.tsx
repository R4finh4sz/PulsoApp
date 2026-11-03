import { Text, View } from 'react-native';

import SuccessImage from '@/assets/images/SucessInQuiz.png';
import Image from '@/components/ui/Image';

export const ActivityComplete = () => (
  <View className="flex-1 items-center gap-5 pt-8">
    <Text
      accessibilityRole="header"
      className="text-center font-poppins_bold text-lg text-[#253044]"
    >
      Quiz concluído!
    </Text>

    <Text className="max-w-[340px] text-center font-poppins text-xs leading-5 text-[#455165]">
      Você respondeu todas as questões deste quiz. Agora é hora de conferir como
      foi o seu desempenho e descobrir o quanto você aprendeu ao longo desta
      atividade.
    </Text>

    <Image
      accessibilityLabel="Ilustração de conclusão do quiz"
      contentFit="contain"
      source={SuccessImage}
      style={{ width: '100%', height: 350, marginTop: 12 }}
    />
  </View>
);
