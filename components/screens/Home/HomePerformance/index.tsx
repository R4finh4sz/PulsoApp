import { ChartNoAxesColumn } from 'lucide-react-native';
import { Text, View } from 'react-native';

type Props = { percentage: number };

export const HomePerformance = ({ percentage }: Props) => (
  <View style={{ backgroundColor: '#0095B3', borderRadius: 18, padding: 14 }}>
    <View className="flex-row items-center justify-between">
      <Text className="font-poppins_semibold text-sm text-white">
        Seu desempenho geral
      </Text>

      <ChartNoAxesColumn color="#FFFFFF" size={19} strokeWidth={1.7} />
    </View>

    <Text
      className="font-poppins_bold text-white"
      style={{ fontSize: 34, marginTop: 12 }}
    >
      {percentage}%
    </Text>

    <Text
      className="font-poppins text-white"
      style={{ fontSize: 11, marginBottom: 10 }}
    >
      de acertos nas atividades
    </Text>

    <View
      accessibilityLabel="Percentual de acertos nas atividades"
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: percentage }}
      style={{
        height: 7,
        backgroundColor: '#59B8CC',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${Math.min(100, Math.max(0, percentage))}%`,
          height: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: 8,
        }}
      />
    </View>
  </View>
);
