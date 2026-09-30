import { router } from 'expo-router';
import {
  BookOpen,
  Calculator,
  CheckCheck,
  Clock3,
  FlaskConical,
  List,
} from 'lucide-react-native';
import { Text, View } from 'react-native';

import { QuizActivity } from '@/components/screens/Quiz/mock';
import Pressable from '@/components/ui/Pressable';

export const ActivityCard = ({
  activity,
  schoolCourseOnly,
}: {
  activity: QuizActivity;
  schoolCourseOnly: boolean;
}) => {
  const appearances = {
    math: { icon: Calculator, color: '#0095B3', background: '' },
    reading: { icon: BookOpen, color: '#A066FF', background: 'bg-[#F3EDFF]' },
    science: {
      icon: FlaskConical,
      color: '#22C55E',
      background: 'bg-[#DAFCE7]',
    },
  };
  const { icon: Icon, color, background } = appearances[activity.kind];
  let deadline = `${activity.daysLeft} dias`;
  let deadlineClass = 'bg-[#D3FAED] text-[#20C980]';
  let deadlineColor = '#20C980';
  if (activity.daysLeft <= 2) {
    deadlineClass = 'bg-[#FFF3D4] text-[#F5AC17]';
    deadlineColor = '#F5AC17';
  }
  if (activity.daysLeft <= 0) {
    deadlineClass = 'bg-[#FFE3E3] text-[#FF575F]';
    deadlineColor = '#FF575F';
    deadline = schoolCourseOnly ? 'Hoje' : 'Prazo hoje';
  }
  if (activity.daysLeft < 0) {
    deadline = 'Vencido';
  }

  return (
    <Pressable
      accessibilityLabel={`${activity.completed ? 'Ver resultado de' : 'Abrir atividade'} ${activity.title}`}
      accessibilityRole="button"
      className="min-h-[146px] flex-row items-center rounded-[20px] border border-[#B8DEE7] bg-[#E6FBFF] p-4 shadow-md"
      onPress={() =>
        router.push({
          pathname: '/(main)/Activity',
          params: { id: activity.id, visit: String(Date.now()) },
        })
      }
    >
      <View className="flex-1 gap-2">
        <View className="mb-1 flex-row items-center justify-between">
          <View
            className={`h-9 w-9 items-center justify-center rounded-xl ${background}`}
          >
            <Icon color={color} size={20} strokeWidth={1.6} />
          </View>

          {!activity.completed && (
            <View
              className={`flex-row items-center gap-1 rounded-full px-2.5 py-1 ${deadlineClass}`}
            >
              <Clock3 color={deadlineColor} size={11} />

              <Text
                className={`font-poppins_semibold text-[10px] ${deadlineClass}`}
              >
                {deadline}
              </Text>
            </View>
          )}
        </View>

        <Text className="font-poppins_medium text-sm text-[#253044]">
          {activity.title}
        </Text>

        <Text className="font-poppins text-[11px] text-[#70839D]">
          {`${activity.schoolCourse} · Prof. ${activity.teacher}`}
        </Text>

        <View className="flex-row items-center gap-2">
          <List color="#70839D" size={13} />

          <Text className="font-poppins text-[11px] text-[#70839D]">
            {activity.questions} questões
          </Text>
        </View>
      </View>

      {activity.completed && (
        <View
          accessibilityLabel="Atividade concluída"
          className="ml-3 h-10 w-10 items-center justify-center rounded-full border border-[#00A0C4]"
        >
          <CheckCheck color="#00A0C4" size={23} />
        </View>
      )}
    </Pressable>
  );
};
