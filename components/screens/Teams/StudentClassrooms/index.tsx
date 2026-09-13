import { ActivityIndicator, Text, View } from 'react-native';

import { TeamsSubjects } from '@/components/screens/Teams/TeamsSubjects';
import Button from '@/components/ui/Button';
import { useStudentClassrooms } from '@/hooks/useStudentClassrooms';

export const StudentClassrooms = () => {
  const { data, isPending, isError, refetch, isFetching } =
    useStudentClassrooms();
  if (isPending) {
    return (
      <ActivityIndicator
        accessibilityLabel="Carregando matérias"
        color="#0095B3"
      />
    );
  }
  if (isError) {
    return (
      <View style={{ gap: 12 }}>
        <Text className="font-poppins">
          Não foi possível carregar sua sala e suas matérias.
        </Text>

        <Button
          isLoading={isFetching}
          text="Tentar novamente"
          onPress={() => {
            refetch();
          }}
        />
      </View>
    );
  }
  if (!data?.length) {
    return (
      <Text className="font-poppins">
        Você ainda não está vinculado a uma sala. Entre em contato com sua
        instituição.
      </Text>
    );
  }
  return (
    <View style={{ gap: 20 }}>
      {data.map(classroom => (
        <View key={classroom.id} style={{ gap: 14 }}>
          <Text
            className="font-poppins_semibold"
            style={{ fontSize: 18, color: '#253044' }}
          >
            {classroom.name}
          </Text>

          {classroom.subjects.length ? (
            <TeamsSubjects subjects={classroom.subjects} />
          ) : (
            <Text className="font-poppins">
              Nenhuma matéria cadastrada nesta sala.
            </Text>
          )}
        </View>
      ))}
    </View>
  );
};
