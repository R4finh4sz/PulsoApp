import { GraduationCap, IdCard, UsersRound } from 'lucide-react-native';
import { Text, View } from 'react-native';

import useAuth from '@/contexts/Auth/useAuth';
import { useStudentClassrooms } from '@/hooks/useStudentClassrooms';

export const ProfileStudentData = () => {
  const { user } = useAuth();
  const { data: classrooms, isPending, isError } = useStudentClassrooms();
  const classroom = classrooms?.find(item => item.id === user?.classroomId);
  let classroomName = classroom?.name || 'Não informada';

  if (isPending) {
    classroomName = 'Carregando…';
  } else if (isError) {
    classroomName = 'Não foi possível carregar';
  }

  const studentDetails = [
    { label: 'Escola', value: 'Não informada', icon: GraduationCap },
    { label: 'Matrícula', value: user?.ra || 'Não informada', icon: IdCard },
    { label: 'Turma', value: classroomName, icon: UsersRound },
  ];

  return (
    <View>
      <Text className="mb-3 font-poppins_bold text-sm text-[#4B5563]">
        Dados do aluno
      </Text>

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
