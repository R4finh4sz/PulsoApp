import { GraduationCap, IdCard, UsersRound } from 'lucide-react-native';
import { ActivityIndicator, Text, View } from 'react-native';

import Button from '@/components/ui/Button';
import useAuth from '@/contexts/Auth/useAuth';
import { useStudentProfile } from '@/hooks/useStudentProfile';
import { formatClassroom } from '@/utils/format';

export const ProfileStudentData = () => {
  const { user: sessionUser } = useAuth();
  const { data, isPending, isError, isFetching, refetch } = useStudentProfile();
  const user = data?.user ?? sessionUser;
  const classrooms = data?.classrooms;
  const classroom = classrooms?.find(item => item.id === user?.classroomId);
  let classroomName = classroom?.name
    ? formatClassroom(classroom.name, classroom.identifier)
    : 'Não informada';

  if (isPending) {
    classroomName = 'Carregando…';
  } else if (isError) {
    classroomName = 'Não foi possível carregar';
  }

  const studentDetails = [
    {
      label: 'Escola',
      value:
        data?.schools.find(school => school.id === String(user?.schoolId))
          ?.name || 'Não informada',
      icon: GraduationCap,
    },
    { label: 'Matrícula', value: user?.ra || 'Não informada', icon: IdCard },
    { label: 'Turma', value: classroomName, icon: UsersRound },
  ];

  return (
    <View>
      <Text className="mb-3 font-poppins_bold text-sm text-[#4B5563]">
        Dados do aluno
      </Text>

      {isPending && (
        <ActivityIndicator
          accessibilityLabel="Carregando perfil"
          color="#0095B3"
        />
      )}

      {isError && (
        <View>
          <Text accessibilityRole="alert">
            Não foi possível carregar o perfil.
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

      <View className="rounded-[15px] bg-[#E6FAFF] px-4 py-1 shadow-md">
        {studentDetails.map(({ label, value, icon: Icon }, index) => (
          <View
            key={label}
            className={`flex-row items-center gap-3 py-4 ${index > 0 ? 'border-t-hairline border-[#DDEFF3]' : ''}`}
          >
            <Icon color="#00A0C0" size={22} strokeWidth={1.7} />

            <View className="flex-1 gap-[3px]">
              <Text className="font-poppins text-[11px] text-[#95A7B4]">
                {label}
              </Text>

              <Text className="font-poppins_medium text-[13px] text-[#4B5563]">
                {value}
              </Text>
            </View>
          </View>
        ))}
      </View>

    </View>
  );
};
