import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActivitiesEmptyState } from '@/components/screens/Quiz/ActivitiesEmptyState';
import { ActivityCard } from '@/components/screens/Quiz/ActivityCard';
import { quizMock } from '@/components/screens/Quiz/mock';
import { BackButton } from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Pressable from '@/components/ui/Pressable';
import TabBar from '@/components/ui/TabBar';
import useAuth from '@/contexts/Auth/useAuth';
import { useStudentActivities } from '@/hooks/useStudentActivities';
import { useStudentClassrooms } from '@/hooks/useStudentClassrooms';
import { isMockEnabled } from '@/services/mock';
import { useQuizStore } from '@/store/quizStore';
import { isPendingStudentActivity } from '@/utils/studentActivities';

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
  const query = useStudentActivities();
  const classrooms = useStudentClassrooms();
  const courses = classrooms.data?.flatMap(room => room.schoolCourses) ?? [];
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
        .filter(activity => activity.completed || activity.daysLeft >= 0)
    : (query.data ?? [])
        .filter(
          item =>
            (!!item.submission || isPendingStudentActivity(item)) &&
            (!schoolCourseOnly || item.activity.subjectId === schoolCourseId) &&
            (currentClassroom === undefined ||
              item.activity.classroomId === currentClassroom),
        )
        .map(({ activity, submission }) => ({
          id: String(activity.id),
          classroomId: activity.classroomId,
          schoolCourseId: activity.subjectId,
          schoolCourse:
            courses.find(course => course.id === activity.subjectId)?.name ??
            'Disciplina',
          teacher: '',
          title: `Atividade ${activity.id}`,
          questions: activity.questionCount,
          completed: !!submission,
          kind: 'reading' as const,
          daysLeft: activity.closesAt
            ? Math.ceil(
                (new Date(activity.closesAt).getTime() - Date.now()) / 86400000,
              )
            : Infinity,
        }));
  const visibleActivities = activities.filter(
    activity => activity.completed === completed,
  );

  const emptyMessage = completed
    ? 'Nenhuma atividade concluída.'
    : 'Nenhuma atividade pendente.';

  return (
    <SafeAreaView
      className="flex-1 bg-neutral-background"
      edges={['top', 'left', 'right']}
    >
      <ScrollView
        alwaysBounceVertical
        contentContainerClassName="grow px-5 pb-8 pt-5"
        refreshControl={
          !isMockEnabled ? (
            <RefreshControl
              accessibilityLabel="Atualizar atividades"
              refreshing={query.isRefetching}
              onRefresh={() => {
                query.refetch();
              }}
              tintColor="#006D83"
              colors={['#006D83']}
            />
          ) : undefined
        }
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
                className={`min-h-11 flex-1 flex-row items-center justify-center gap-4 rounded-xl border px-2 py-2 ${completed === value ? 'border-[#006D83] bg-[#006D83]' : 'border-[#CBD5E1] bg-white'}`}
                onPress={() => setCompleted(value)}
              >
                <Text
                  className={`font-poppins_medium text-xs ${completed === value ? 'text-white' : 'text-[#455165]'}`}
                >
                  {value ? 'Concluídas' : 'Pendentes'}
                </Text>

                <Text
                  className={`rounded-full px-2 font-poppins_semibold text-[10px] ${completed === value ? 'bg-white text-[#006D83]' : 'bg-[#E2E8F0] text-[#455165]'}`}
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
            {!isMockEnabled && query.isPending && (
              <ActivityIndicator
                accessibilityLabel="Carregando atividades"
                color="#0095B3"
              />
            )}

            {query.isError && (
              <>
                <Text accessibilityRole="alert">
                  Não foi possível carregar as atividades.
                </Text>

                <Button
                  text="Tentar novamente"
                  onPress={() => {
                    query.refetch();
                  }}
                />
              </>
            )}

            {visibleActivities.map(activity => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                schoolCourseOnly={schoolCourseOnly}
              />
            ))}

            {!visibleActivities.length &&
              (isMockEnabled || (!query.isPending && !query.isError)) && (
                <ActivitiesEmptyState message={emptyMessage} />
              )}
          </View>
        </View>
      </ScrollView>

      {!schoolCourseOnly && <TabBar />}
    </SafeAreaView>
  );
};
