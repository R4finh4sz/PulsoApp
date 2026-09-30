import { router } from 'expo-router';
import { BookOpen } from 'lucide-react-native';
import { ActivityIndicator, Text, View } from 'react-native';

import Button from '@/components/ui/Button';
import Pressable from '@/components/ui/Pressable';
import { useStudentClassrooms } from '@/hooks/useStudentClassrooms';

export const HomeSchoolCourses = ({ onViewAll }: { onViewAll: () => void }) => {
  const { data, isPending, isError, isFetching, refetch } =
    useStudentClassrooms();
  const schoolCourses =
    data?.flatMap(classroom => classroom.schoolCourses) ?? [];

  return (
    <View>
      <View
        className="flex-row items-center justify-between"
        style={{ gap: 8, marginBottom: 12 }}
      >
        <Text
          className="font-poppins_medium text-base"
          style={{ color: '#253044', flex: 1 }}
        >
          Matérias da sua sala
        </Text>

        <Pressable
          accessibilityRole="button"
          style={{ minHeight: 44, justifyContent: 'center', paddingLeft: 8 }}
          onPress={onViewAll}
        >
          <Text className="font-poppins text-xs" style={{ color: '#0095B3' }}>
            Ver tudo
          </Text>
        </Pressable>
      </View>

      {isPending && (
        <ActivityIndicator
          accessibilityLabel="Carregando matérias"
          color="#0095B3"
        />
      )}

      {!isPending && isError && (
        <View style={{ gap: 12 }}>
          <Text className="font-poppins text-xs" style={{ color: '#71849D' }}>
            Não foi possível carregar suas matérias.
          </Text>

          <Button
            isLoading={isFetching}
            text="Tentar novamente"
            onPress={() => {
              refetch();
            }}
          />
        </View>
      )}

      {!isPending && !isError && !schoolCourses.length && (
        <Text className="font-poppins text-xs" style={{ color: '#71849D' }}>
          {data?.length
            ? 'Nenhuma matéria cadastrada nesta sala.'
            : 'Você ainda não está vinculado a uma sala.'}
        </Text>
      )}

      {!isPending && !isError && schoolCourses.length > 0 && (
        <View style={{ gap: 12 }}>
          {schoolCourses.map(schoolCourse => (
            <Pressable
              key={schoolCourse.id}
              accessibilityLabel={`Ver atividades de ${schoolCourse.name}`}
              accessibilityRole="button"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                backgroundColor: '#E6FBFF',
                padding: 14,
                borderRadius: 18,
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.09,
                shadowRadius: 5,
                elevation: 3,
              }}
              onPress={() =>
                router.push({
                  pathname: '/(main)/SchoolCourseActivities',
                  params: {
                    schoolCourseId: schoolCourse.id,
                    schoolCourseName: schoolCourse.name,
                    classroomId: schoolCourse.classroomId,
                  },
                })
              }
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#F3EDFF',
                }}
              >
                <BookOpen color="#A066FF" size={22} strokeWidth={1.5} />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  className="font-poppins_medium"
                  style={{ color: '#253044', fontSize: 13 }}
                >
                  {schoolCourse.name}
                </Text>

                <Text
                  className="font-poppins"
                  style={{ color: '#71849D', fontSize: 11, marginTop: 2 }}
                >
                  Ver atividades
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};
