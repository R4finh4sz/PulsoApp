import { BookOpen, Calculator, FlaskConical } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { TeacherCard } from '@/assets/icons';
import type { TeamSubject } from '@/components/screens/Teams/mock';

const subjectStyles = {
  math: { Icon: Calculator, color: '#7F3E3B', background: '#F3BEBD' },
  reading: { Icon: BookOpen, color: '#A066FF', background: '#F3EDFF' },
  science: { Icon: FlaskConical, color: '#00C853', background: '#DCFFEA' },
};

type Props = { subject: TeamSubject };

export const TeamsSubjectCard = ({ subject }: Props) => {
  const { Icon, color, background } = subjectStyles[subject.kind];

  return (
    <View
      style={{
        backgroundColor: '#E6FBFF',
        padding: 16,
        borderRadius: 20,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.14,
        shadowRadius: 5,
        elevation: 4,
      }}
    >
      <View
        className="flex-row items-center justify-between"
        style={{ marginBottom: 12, gap: 12 }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: background,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon color={color} size={20} strokeWidth={1.5} />
        </View>

        <View
          style={{
            backgroundColor: '#F1F5F9',
            borderRadius: 20,
            paddingHorizontal: 11,
            paddingVertical: 5,
          }}
        >
          <Text
            className="font-poppins"
            style={{ fontSize: 10, color: '#617694' }}
          >
            {`${subject.activityCount} ${subject.activityCount === 1 ? 'atividade' : 'atividades'}`}
          </Text>
        </View>
      </View>

      <Text
        className="font-poppins_medium text-base color-[#1E293B]"
        style={{ fontSize: 15, color: '#253044', marginBottom: 10 }}
      >
        {subject.title}
      </Text>

      <View className="flex-row items-center" style={{ gap: 8 }}>
        <TeacherCard />

        <Text className="font-poppins text-xs color-[#64748B]">
          {subject.teacher}
        </Text>
      </View>
    </View>
  );
};
