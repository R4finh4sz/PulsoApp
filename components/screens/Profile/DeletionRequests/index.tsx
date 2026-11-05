import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/ui/BackButton';
import Pressable from '@/components/ui/Pressable';
import useAuth from '@/contexts/Auth/useAuth';
import { shadow } from '@/global/shadow';
import { profileService } from '@/services/profile';
import { getErrorMessage } from '@/utils/getErrorMessage';

export const DeletionRequests = ({
  onNew,
  onBack,
}: {
  onNew: () => void;
  onBack: () => void;
}) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const requests = useQuery({
    queryKey: ['deletion-requests', user?.id],
    queryFn: ({ signal }) => profileService.deletionRequests(signal),
  });

  return (
    <View
      className="flex-1 bg-neutral-background"
      style={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }}
    >
      <View className="w-full max-w-[560px] flex-1 self-center px-6">
        <BackButton onPress={onBack} />

        <Text
          accessibilityRole="header"
          className="mb-6 mt-9 font-poppins_bold text-xl text-[#253044]"
        >
          Solicitações de exclusão
        </Text>

        <ScrollView className="flex-1" contentContainerClassName="gap-4 pb-6">
          {requests.isPending && (
            <ActivityIndicator
              accessibilityLabel="Carregando solicitações"
              color="#0095B3"
            />
          )}

          {requests.isError && (
            <View className="gap-3">
              <Text
                accessibilityRole="alert"
                className="font-poppins text-sm text-alert-error-primary"
              >
                {getErrorMessage(
                  requests.error,
                  'Não foi possível carregar as solicitações.',
                )}
              </Text>

              <Pressable
                accessibilityRole="button"
                className="min-h-11 justify-center"
                onPress={() => requests.refetch()}
              >
                <Text className="font-poppins_semibold text-sm text-[#006D83]">
                  Tentar novamente
                </Text>
              </Pressable>
            </View>
          )}

          {requests.data?.length === 0 && (
            <Text className="font-poppins text-sm text-[#455165]">
              Você ainda não possui solicitações de exclusão.
            </Text>
          )}

          {requests.data?.map(request => (
            <View
              key={request.id}
              className="gap-2 rounded-xl border border-neutral-20 bg-white p-4"
              style={shadow.default}
            >
              <Text className="font-poppins_semibold text-sm text-[#253044]">
                {
                  {
                    PENDING: 'Pendente',
                    APPROVED: 'Aprovada',
                    REJECTED: 'Rejeitada',
                  }[request.status]
                }
              </Text>

              <Text className="font-poppins text-xs text-[#455165]">
                {new Date(request.requestedAt).toLocaleDateString('pt-BR')}
              </Text>

              <Text className="font-poppins text-sm text-[#455165]">
                {request.reason}
              </Text>

              {!!request.reviewReason && (
                <Text className="font-poppins text-sm text-[#455165]">
                  Retorno: {request.reviewReason}
                </Text>
              )}
            </View>
          ))}
        </ScrollView>

        <Pressable
          accessibilityRole="button"
          className="mt-4 min-h-12 items-center justify-center rounded-lg bg-[#DE3737] px-4 py-3"
          onPress={onNew}
        >
          <Text className="font-poppins_semibold text-base text-white">
            Excluir conta
          </Text>
        </Pressable>
      </View>
    </View>
  );
};
