import { CheckCircle2 } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { calculateResult } from '@/components/screens/Quiz/questions';

export const ActivityResult = ({
  result,
}: {
  result: ReturnType<typeof calculateResult>;
}) => (
  <View className="flex-1 items-center gap-5 pt-8">
    <Text
      accessibilityRole="header"
      className="text-center font-poppins_bold text-lg text-[#253044]"
    >
      Resultado da atividade
    </Text>

    <View className="mt-6 h-36 w-36 items-center justify-center rounded-full border border-[#00A0C4]">
      <Text
        className="text-center font-poppins_bold text-[42px] text-[#0095B3]"
        style={{ includeFontPadding: false, lineHeight: 56 }}
      >
        {result.percentage}%
      </Text>
    </View>

    <View className="flex-row items-center gap-2 rounded-full bg-[#27CFF0] px-4 py-2">
      <CheckCircle2 color="white" size={16} />

      <Text className="font-poppins_semibold text-xs text-white">
        {`${result.correct} de ${result.total} questões corretas`}
      </Text>
    </View>

    <View className="mt-6 w-full gap-3">
      <Text className="mb-1 font-poppins_bold text-sm text-[#253044]">
        Desempenho por conteúdo
      </Text>

      {result.contents.map(content => {
        let color = '#FF4D57';
        if (content.percentage >= 70) {
          color = '#22C55E';
        } else if (content.percentage >= 40) {
          color = '#F59E0B';
        }
        return (
          <View
            key={content.name}
            className="gap-3 rounded-2xl bg-[#E3E3E3] p-4"
          >
            <View className="flex-row items-center justify-between gap-2">
              <Text className="flex-1 font-poppins text-xs text-[#455165]">
                {content.name}
              </Text>

              <Text
                className="rounded-full bg-white px-3 py-1 font-poppins_semibold text-xs"
                style={{ color }}
              >
                {content.percentage}%
              </Text>
            </View>

            <View
              accessible
              accessibilityLabel={content.name}
              accessibilityRole="progressbar"
              accessibilityValue={{
                min: 0,
                max: 100,
                now: content.percentage,
              }}
              className="h-2 overflow-hidden rounded-full bg-[#F1F5F9]"
            >
              <View
                style={{
                  width: `${content.percentage}%`,
                  backgroundColor: color,
                  height: '100%',
                  borderRadius: 10,
                }}
              />
            </View>
          </View>
        );
      })}
    </View>
  </View>
);
