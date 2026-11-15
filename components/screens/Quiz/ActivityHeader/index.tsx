import { Text, View } from 'react-native';

import { BackButton } from '@/components/ui/BackButton';

export type ActivityStage = 'details' | 'quiz' | 'complete' | 'result';

export const ActivityHeader = ({
  screen,
  step,
  total,
  onClose,
}: {
  screen: ActivityStage;
  step: number;
  total: number;
  onClose: () => void;
}) => (
  <View className="mb-3 min-h-12 flex-row items-center justify-between gap-3">
    <BackButton
      accessibilityLabel={screen === 'details' ? 'Voltar' : 'Fechar quiz'}
      label=""
      variant={screen === 'details' ? 'back' : 'close'}
      onPress={onClose}
    />

    <Text
      accessibilityRole="header"
      className="flex-1 text-center font-poppins_bold text-lg text-[#253044]"
    >
      {
        {
          details: 'Detalhes da atividade',
          quiz: 'Quiz',
          complete: '',
          result: '',
        }[screen]
      }
    </Text>

    {screen === 'quiz' ? (
      <Text className="rounded-lg border border-[#99CCD7] bg-[#E0E8EA] px-3 py-1 font-poppins_medium text-xs text-[#253044]">
        {`${step + 1}/${total}`}
      </Text>
    ) : (
      <View className="w-5" />
    )}
  </View>
);
