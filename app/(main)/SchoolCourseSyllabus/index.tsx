import { router, useLocalSearchParams } from 'expo-router';
import { BookOpen, FileText } from 'lucide-react-native';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import { useStudentClassrooms } from '@/hooks/useStudentClassrooms';

const SchoolCourseSyllabus = () => {
  const { schoolCourseId, classroomId } = useLocalSearchParams<{
    schoolCourseId: string;
    classroomId: string;
  }>();
  const insets = useSafeAreaInsets();
  const query = useStudentClassrooms();
  const course = query.data
    ?.find(room => room.id === Number(classroomId))
    ?.schoolCourses.find(item => item.id === Number(schoolCourseId));

  return (
    <ScrollView
      className="flex-1 bg-neutral-background"
      contentContainerClassName="grow px-6"
      contentContainerStyle={{
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 32,
      }}
    >
      <View className="w-full max-w-[560px] self-center">
        <View className="mb-9 flex-row items-center gap-4">
          <BackButton
            label="Voltar"
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.replace('/(main)/Teams')
            }
          />
        </View>

        {query.isPending && (
          <ActivityIndicator
            accessibilityLabel="Carregando ementa"
            color="#0095B3"
          />
        )}

        {query.isError && (
          <View className="gap-4">
            <Text
              accessibilityRole="alert"
              className="font-poppins text-sm text-[#455165]"
            >
              Não foi possível carregar a ementa.
            </Text>

            <Button
              text="Tentar novamente"
              onPress={() => {
                query.refetch();
              }}
            />
          </View>
        )}

        {!query.isPending &&
          !query.isError &&
          (course ? (
            <View>
              <View className="flex-row items-center gap-3">
                <View className="h-12 w-12 items-center justify-center rounded-xl bg-[#E7FAFD]">
                  <BookOpen color="#0095B3" size={24} strokeWidth={1.6} />
                </View>

                <Text
                  accessibilityRole="header"
                  className="flex-1 font-poppins_semibold text-lg leading-7 text-[#253044]"
                >
                  {course.name}
                </Text>
              </View>

              <View className="mb-7 mt-6 h-px bg-[#DDE8EC]" />

              <View className="mb-4 flex-row items-center gap-2">
                <FileText color="#006D83" size={18} strokeWidth={1.7} />

                <Text
                  accessibilityRole="header"
                  className="font-poppins_semibold text-base text-[#253044]"
                >
                  Sobre a matéria
                </Text>
              </View>

              <Text
                selectable
                className="font-poppins text-[15px] leading-7 text-[#455165]"
              >
                {course.syllabus?.trim() ||
                  'A ementa desta matéria ainda não foi disponibilizada.'}
              </Text>

              {!!course.topics?.length && (
                <View className="mt-8">
                  <Text
                    accessibilityRole="header"
                    className="mb-4 font-poppins_semibold text-base text-[#253044]"
                  >
                    Tópicos
                  </Text>

                  {course.topics.map(topic => (
                    <View
                      key={topic.title}
                      className="mb-5 gap-2 border-b border-[#DDE8EC] pb-5"
                    >
                      <Text
                        accessibilityRole="header"
                        className="font-poppins_semibold text-sm text-[#253044]"
                      >
                        {topic.title}
                      </Text>

                      {!!topic.description?.trim() && (
                        <Text
                          selectable
                          className="font-poppins text-sm leading-6 text-[#455165]"
                        >
                          {topic.description}
                        </Text>
                      )}

                      {!!topic.references?.trim() && (
                        <View className="mt-1 gap-1">
                          <Text className="font-poppins_medium text-xs text-[#006D83]">
                            Referências
                          </Text>

                          <Text
                            selectable
                            className="font-poppins text-xs leading-5 text-[#455165]"
                          >
                            {topic.references}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <Text className="font-poppins text-sm text-[#455165]">
              Matéria não encontrada.
            </Text>
          ))}
      </View>
    </ScrollView>
  );
};

export default SchoolCourseSyllabus;
