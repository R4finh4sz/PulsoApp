import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Trophy } from 'lucide-react-native';
import { useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/DropDown';
import useAuth from '@/contexts/Auth/useAuth';
import { useStudentProfile } from '@/hooks/useStudentProfile';
import { rankingService } from '@/services/rankings';

const Ranking = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const profile = useStudentProfile();
  const { control, watch } = useForm({
    defaultValues: { scope: 'general', bimester: '4' },
  });
  const [scope, bimester] = watch(['scope', 'bimester']);
  const year = new Date().getFullYear();
  const schoolId = profile.data?.user.schoolId ?? user?.schoolId;
  const missingSchool = scope === 'school' && !schoolId;
  const query = useQuery({
    queryKey: ['student-ranking', user?.id, year, bimester, scope, schoolId],
    enabled: !!user && !missingSchool,
    queryFn: ({ signal }) =>
      rankingService.list(
        {
          year,
          bimester: Number(bimester),
          ...(scope === 'school' && schoolId ? { schoolId } : {}),
        },
        signal,
      ),
  });

  return (
    <View className="flex-1 bg-neutral-background">
      <ScrollView
        contentContainerClassName="grow px-5"
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 32,
        }}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching}
            onRefresh={() => {
              if (!missingSchool) {
                query.refetch();
              }
            }}
          />
        }
      >
        <View className="w-full max-w-[560px] self-center">
          <View className="mb-8 flex-row items-center gap-4">
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
              className="flex-1 font-poppins_bold text-xl text-[#253044]"
            >
              Ranking
            </Text>

            <Trophy color="#996B00" size={26} strokeWidth={1.8} />
          </View>

          <Text
            accessibilityRole="header"
            className="font-poppins_medium text-base text-[#253044]"
          >
            Destaques do app
          </Text>

          <Text className="mt-2 font-poppins text-sm leading-6 text-[#455165]">
            Confira a classificação por percentual de acertos nas atividades.
          </Text>

          <View className="my-5 gap-4">
            <Dropdown
              control={control}
              label="Ranking"
              name="scope"
              options={[
                { value: 'general', label: 'Geral do sistema' },
                { value: 'school', label: 'Minha escola' },
              ]}
            />

            <Dropdown
              control={control}
              label={`Bimestre de ${year}`}
              name="bimester"
              options={[1, 2, 3, 4].map(value => ({
                value: String(value),
                label: `${value}º bimestre`,
              }))}
            />
          </View>

          {missingSchool && (
            <Text className="mb-5 font-poppins text-sm text-[#455165]">
              Não foi possível identificar sua escola. Consulte o ranking geral.
            </Text>
          )}

          {!missingSchool && query.isPending && (
            <ActivityIndicator
              accessibilityLabel="Carregando ranking"
              color="#006D83"
            />
          )}

          {!missingSchool && query.isError && (
            <View className="mb-5 gap-3">
              <Text
                accessibilityRole="alert"
                className="font-poppins text-sm text-[#455165]"
              >
                Não foi possível carregar o ranking.
              </Text>

              <Button
                accessibilityRole="button"
                text="Tentar novamente"
                onPress={() => {
                  query.refetch();
                }}
              />
            </View>
          )}

          {!missingSchool && query.isSuccess && !query.data?.length && (
            <Text className="mb-5 font-poppins text-sm text-[#455165]">
              Nenhum resultado neste bimestre.
            </Text>
          )}

          <View className="flex-row items-center justify-between px-4 pb-3">
            <Text className="font-poppins_semibold text-sm text-[#455165]">
              {scope === 'school'
                ? 'Classificação da escola'
                : 'Classificação geral'}
            </Text>

            <Text className="font-poppins text-xs text-[#455165]">Acertos</Text>
          </View>

          <View className="overflow-hidden rounded-2xl border border-[#CBD5E1] bg-white">
            {!missingSchool &&
              !query.isError &&
              query.data?.map((student, index) => (
                <View
                  key={student.studentId}
                  accessible
                  accessibilityLabel={`${student.position}º lugar, ${student.studentName}, ${student.accuracyPercentage}% de acertos, ${student.totalActivities} atividades`}
                  className={`flex-row items-center gap-3 px-4 py-5 ${index > 0 ? 'border-t border-[#E2E8F0]' : 'bg-[#FFF9E8]'}`}
                >
                  <View className="w-8 items-center gap-1">
                    {student.position <= 3 && (
                      <Trophy
                        color={
                          ['#996B00', '#526477', '#995C38'][
                            student.position - 1
                          ]
                        }
                        size={20}
                        strokeWidth={1.8}
                      />
                    )}

                    <Text className="font-poppins_semibold text-sm text-[#455165]">
                      {student.position}º
                    </Text>
                  </View>

                  <View className="flex-1 gap-1">
                    <Text className="font-poppins_semibold text-sm text-[#253044]">
                      {student.studentName}
                    </Text>

                    <Text className="font-poppins text-xs text-[#455165]">
                      {student.totalActivities} atividades concluídas
                    </Text>
                  </View>

                  <Text className="font-poppins_bold text-lg text-[#006D83]">
                    {student.accuracyPercentage}%
                  </Text>
                </View>
              ))}
          </View>

          <Text className="mt-5 font-poppins text-xs leading-5 text-[#455165]">
            Cada atividade é uma oportunidade de aprender. Continue praticando
            no seu ritmo!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default Ranking;
