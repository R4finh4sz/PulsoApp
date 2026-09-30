import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActivityCard } from '@/components/screens/Quiz/ActivityCard';
import { quizMock } from '@/components/screens/Quiz/mock';
import { BackButton } from '@/components/ui/BackButton';
import Pressable from '@/components/ui/Pressable';
import TabBar from '@/components/ui/TabBar';
import useAuth from '@/contexts/Auth/useAuth';
import { isMockEnabled } from '@/services/mock';
import { useQuizStore } from '@/store/quizStore';

type Props = {
  schoolCourseId?: number;
  schoolCourseName?: string;
  classroomId?: number;
};

export const ActivitiesScreen = ({
  schoolCourseId,
  schoolCourseName,
  classroomId,
}: Props) => {
  const { user } = useAuth();
  const results = useQuizStore(state => state.results);
  const [completed, setCompleted] = useState(false);
  const schoolCourseOnly = schoolCourseId !== undefined;
  const currentClassroom = classroomId ?? user?.classroomId;
  const activities = isMockEnabled
    ? quizMock
        .filter(
          activity =>
            activity.classroomId === currentClassroom &&
            (!schoolCourseOnly || activity.schoolCourseId === schoolCourseId),
        )
        .map(activity => ({
          ...activity,
          completed:
            activity.completed || !!results[`${user?.id}:${activity.id}`],
        }))
    : [];
  const visibleActivities = activities.filter(
    activity => activity.completed === completed,
  );

  let emptyMessage = completed
    ? 'Nenhuma atividade concluída.'
    : 'Nenhuma atividade pendente.';
  if (!isMockEnabled) {
    emptyMessage = 'A consulta de atividades ainda não está disponível.';
  }

  return (
    <SafeAreaView
      className="flex-1 bg-neutral-background"
      edges={['top', 'left', 'right']}
    >
      <ScrollView
        contentContainerClassName="grow px-5 pb-8 pt-5"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-[560px] self-center">
          <View className="mb-12 flex-row items-center gap-4">
            <BackButton
              label=""
              onPress={() =>
                router.canGoBack()
                  ? router.back()
                  : router.replace('/(main)/Home')
              }
            />

            <Text
              accessibilityRole="header"
              className="flex-1 font-poppins_bold text-lg text-[#253044]"
            >
              {schoolCourseOnly
                ? `Atividades de ${schoolCourseName ?? 'matéria'}`
                : 'Minhas atividades'}
            </Text>
          </View>

          <View accessibilityRole="tablist" className="mb-5 flex-row gap-3">
            {[false, true].map(value => (
              <Pressable
                key={String(value)}
                accessibilityRole="tab"
                accessibilityState={{ selected: completed === value }}
                className={`min-h-11 flex-1 flex-row items-center justify-center gap-4 rounded-xl border px-2 py-2 ${completed === value ? 'border-[#00A0C4] bg-[#E6FBFF]' : 'border-transparent bg-[#E9EAEA]'}`}
                onPress={() => setCompleted(value)}
              >
                <Text
                  className={`font-poppins_medium text-xs ${completed === value ? 'text-[#008CAB]' : 'text-[#70839D]'}`}
                >
                  {value ? 'Concluídas' : 'Pendentes'}
                </Text>

                <Text
                  className={`rounded-full px-2 font-poppins_semibold text-[10px] ${completed === value ? 'bg-[#008CAB] text-white' : 'bg-[#E2E8F0] text-[#70839D]'}`}
                >
                  {
                    activities.filter(activity => activity.completed === value)
                      .length
                  }
                </Text>
              </Pressable>
            ))}
          </View>

          <View className="gap-3">
            {visibleActivities.map(activity => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                schoolCourseOnly={schoolCourseOnly}
              />
            ))}

            {!visibleActivities.length && (
              <Text className="py-12 text-center font-poppins text-sm text-[#70839D]">
                {emptyMessage}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {!schoolCourseOnly && <TabBar />}
    </SafeAreaView>
  );
};
