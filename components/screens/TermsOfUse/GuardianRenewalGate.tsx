import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';
import { ActivityIndicator, Modal, Text, View } from 'react-native';

import Button from '@/components/ui/Button';
import ModalBackdrop from '@/components/ui/Modals/ModalBackdrop';
import useAuth from '@/contexts/Auth/useAuth';
import api from '@/services/api';
import { isMockEnabled } from '@/services/mock';

type RenewalStatus = {
  required: boolean;
  sendsRemaining: number;
  nextSendAt: string | null;
};

const path = '/me/guardian-renewal';

export const GuardianRenewalGate = ({ children }: PropsWithChildren) => {
  const { user, logout } = useAuth();
  const client = useQueryClient();
  const queryKey = ['guardian-renewal', user?.id];
  const status = useQuery({
    queryKey,
    enabled: !isMockEnabled,
    // shortcut: responsavel pendente no mock, remover ao concluir o teste de aceite.
    initialData: isMockEnabled
      ? { required: true, sendsRemaining: 3, nextSendAt: null }
      : undefined,
    queryFn: async ({ signal }) =>
      (await api.get<RenewalStatus>(path, { signal })).data,
    refetchInterval: query => {
      const next = query.state.data?.nextSendAt;
      const remaining = next ? Date.parse(next) - Date.now() : 0;
      return remaining > 0 ? Math.min(15_000, remaining) : 15_000;
    },
  });
  const send = useMutation({
    mutationFn: async () =>
      (await api.post<RenewalStatus>(`${path}/send`)).data,
    onSuccess: async data => {
      await client.cancelQueries({ queryKey });
      client.setQueryData(queryKey, data);
    },
    onError: () => {
      void status.refetch();
    },
  });

  if (status.data?.required === false) {
    return children;
  }
  if (status.isPending) {
    return (
      <ActivityIndicator accessibilityLabel="Verificando aceite do responsável" />
    );
  }

  const remaining = status.data?.sendsRemaining ?? 0;
  const waiting =
    !!status.data?.nextSendAt &&
    Date.parse(status.data.nextSendAt) > Date.now();
  const availability =
    remaining === 0
      ? 'Você atingiu o limite de envios desta sessão.'
      : waiting
        ? 'Aguarde três minutos entre os envios.'
        : `Envios disponíveis nesta sessão: ${remaining} de 3.`;

  return (
    <Modal transparent visible animationType="fade" onRequestClose={() => {}}>
      <ModalBackdrop
        message={
          status.data
            ? 'O termo do responsável ou a Política de Privacidade mudou. Seu responsável precisa aceitar os documentos atualizados para liberar seu acesso.'
            : 'Verifique sua conexão. O aceite será consultado novamente automaticamente.'
        }
        showIcon={false}
        title={
          status.data
            ? 'Aceite do responsável pendente'
            : 'Não foi possível verificar o aceite'
        }
        variant="info"
      >
        <View className="mt-4 w-full gap-3">
          {isMockEnabled && (
            <Text className="text-center text-sm text-black">
              Demonstração: aceite do responsável pendente. Nenhum e-mail será
              enviado.
            </Text>
          )}

          {status.data && (
            <Text
              accessibilityLiveRegion="polite"
              className="text-center text-sm text-black"
            >
              {send.isError
                ? 'Não foi possível solicitar o envio. Confira a disponibilidade abaixo.'
                : send.isSuccess
                  ? 'Envio solicitado. Peça ao seu responsável para conferir o e-mail.'
                  : null}

              {'\n'}

              {availability}
            </Text>
          )}

          <View className="w-full flex-row gap-3">
            <View className="min-w-0 flex-1">
              <Button
                className="min-h-11"
                disabled={
                  isMockEnabled ||
                  !status.data ||
                  !remaining ||
                  waiting ||
                  send.isPending
                }
                isLoading={send.isPending}
                text="Enviar link"
                onPress={() => send.mutate()}
              />
            </View>

            <View className="min-w-0 flex-1">
              <Button
                wired
                className="min-h-11"
                text="Sair"
                onPress={() => {
                  logout();
                }}
              />
            </View>
          </View>
        </View>
      </ModalBackdrop>
    </Modal>
  );
};
