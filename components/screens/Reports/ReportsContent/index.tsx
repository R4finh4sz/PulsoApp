import { TrendingUp } from 'lucide-react-native';
import { Text, View } from 'react-native';

import PerformanceImage from '@/assets/images/PerformanceImage.png';
import { reportsMock } from '@/components/screens/Reports/mock';
import Image from '@/components/ui/Image';

export const ReportsContent = () => (
  <View>
    <View
      className="flex-row items-center justify-between"
      style={{
        backgroundColor: '#008FAB',
        borderRadius: 20,
        padding: 20,
        gap: 16,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          className="font-poppins_medium text-xs"
          style={{ color: '#BAEAF3' }}
        >
          Aproveitamento geral
        </Text>

        <Text
          className="font-poppins_bold text-white"
          style={{ fontSize: 36, lineHeight: 48, marginTop: 6 }}
        >
          {reportsMock.percentage}%
        </Text>

        <Text
          className="font-poppins text-xs"
          style={{ color: '#D4F2F7', marginTop: 4 }}
        >
          Nas últimas {reportsMock.activities} atividades
        </Text>
      </View>

      <View
        style={{
          width: 58,
          height: 58,
          borderRadius: 29,
          backgroundColor: '#2DD4F4',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <TrendingUp color="#FFFFFF" size={30} strokeWidth={2.2} />
      </View>
    </View>

    <View style={{ marginTop: 20 }}>
      <Text
        accessibilityRole="header"
        className="font-poppins_bold text-sm"
        style={{ color: '#253044', marginBottom: 22 }}
      >
        % de acerto por disciplina
      </Text>

      <View style={{ gap: 12 }}>
        {reportsMock.subjects.map(subject => (
          <View
            key={subject.name}
            className="flex-row items-center"
            style={{ gap: 8 }}
          >
            <Text
              className="font-poppins text-xs"
              style={{ width: 86, color: '#384458' }}
            >
              {subject.name}
            </Text>

            <View
              accessibilityLabel={`Acertos em ${subject.name}`}
              accessibilityRole="progressbar"
              accessibilityValue={{ min: 0, max: 100, now: subject.percentage }}
              style={{
                flex: 1,
                height: 11,
                borderRadius: 8,
                backgroundColor: '#C5E2E9',
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  width: `${subject.percentage}%`,
                  height: '100%',
                  borderRadius: 8,
                  backgroundColor: subject.color,
                }}
              />
            </View>

            <Text
              className="font-poppins_semibold text-xs"
              style={{ width: 34, textAlign: 'right', color: subject.color }}
            >
              {subject.percentage}%
            </Text>
          </View>
        ))}
      </View>
    </View>

    <View style={{ marginTop: 40, alignItems: 'center' }}>
      <Image
        withoutBackground
        accessibilityLabel="Estudante comemorando sua formatura"
        contentFit="contain"
        source={PerformanceImage}
        style={{ width: '100%', maxWidth: 340, aspectRatio: 1600 / 1162 }}
      />
    </View>
  </View>
);
