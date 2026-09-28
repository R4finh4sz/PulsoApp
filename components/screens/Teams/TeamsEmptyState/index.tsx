import { Text, View } from 'react-native';

import EmptyImage from '@/assets/images/EmptyImage.png';
import Image from '@/components/ui/Image';

export const TeamsEmptyState = () => (
  <View>
    <Text
      accessibilityRole="header"
      className="mb-4 text-center font-poppins_semibold text-lg color-[#253044]"
    >
      Nenhuma matéria encontrada
    </Text>

    <Text className="text-center font-poppins text-sm color-[#384458]">
      No momento, não há matérias disponíveis para você. Assim que novas
      matérias forem cadastradas pelos professores, elas aparecerão aqui
      automaticamente.
      {'\n'}
      Continue acompanhando a plataforma para acessar novos conteúdos e
      acompanhar sua jornada de aprendizagem.
    </Text>

    <Image
      withoutBackground
      accessibilityLabel="Dois estudantes aguardando novas matérias"
      contentFit="contain"
      source={EmptyImage}
      style={{ width: '100%', maxWidth: 320, aspectRatio: 1, marginTop: 24 }}
    />

    <Text className="mt-3 text-center font-poppins text-sm color-[#6B7280]">
      https://storyset.com/
    </Text>
  </View>
);
