import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { PropsWithChildren, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TermsOfUseContent } from '@/components/screens/TermsOfUse/TermsOfUseContent';
import { TermsOfUseHeader } from '@/components/screens/TermsOfUse/TermsOfUseHeader';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import useAuth from '@/contexts/Auth/useAuth';
import { termsService } from '@/services/terms';
import { getErrorMessage } from '@/utils/getErrorMessage';

export const TermsGate = ({ children }: PropsWithChildren) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [checkedVersion, setCheckedVersion] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const terms = useQuery({
    queryKey: ['terms', 'current'],
    queryFn: termsService.current,
  });
  const accepted = useQuery({
    queryKey: ['terms', 'accepted', user?.id],
    queryFn: termsService.accepted,
  });
  const allowed =
    !!terms.data &&
    !!accepted.data?.includes(terms.data.version) &&
    !terms.isError &&
    !accepted.isError;
  const accept = async () => {
    if (!terms.data || checkedVersion !== terms.data.version || submitting) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await termsService.accept(terms.data.version);
      const result = await accepted.refetch();
      if (result.error) {
        throw result.error;
      }
    } catch (cause) {
      setError(
        getErrorMessage(
          cause,
          'Não foi possível salvar o aceite. Tente novamente.',
        ),
      );
      if (axios.isAxiosError(cause) && cause.response?.status === 409) {
        setCheckedVersion(null);
        await terms.refetch();
      }
    } finally {
      setSubmitting(false);
    }
  };
  if (allowed) {
    return children;
  }
  const loadError = terms.error || accepted.error;
  return (
    <Modal
      visible
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={() => {}}
    >
      <View className="flex-1 bg-neutral-background">
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 32,
            paddingHorizontal: 20,
          }}
        >
          <View className="w-full max-w-[560px] self-center">
            <TermsOfUseHeader hideBack title={terms.data?.title} />

            <Text className="mb-6 text-center font-poppins text-sm text-[#70839D]">
              Leia e aceite os termos de uso para continuar no Pulso.
            </Text>

            {(terms.isPending || accepted.isPending) && (
              <ActivityIndicator accessibilityLabel="Carregando termos" />
            )}

            {loadError && (
              <View className="gap-4">
                <Text className="text-center font-poppins text-sm">
                  {getErrorMessage(
                    loadError,
                    'Não foi possível carregar os termos. Tente novamente.',
                  )}
                </Text>

                <Button
                  text="Tentar novamente"
                  onPress={() => {
                    terms.refetch();
                    accepted.refetch();
                  }}
                />
              </View>
            )}

            {!terms.isPending &&
              !accepted.isPending &&
              !loadError &&
              terms.data && (
                <>
                  <TermsOfUseContent content={terms.data.content} />

                  <Text className="my-4 text-center font-poppins text-xs text-[#70839D]">
                    Versão {terms.data.version}
                  </Text>

                  <View className="mt-6 gap-6 px-6">
                    <Checkbox
                      checked={checkedVersion === terms.data.version}
                      onToggle={value => {
                        if (!submitting) {
                          setCheckedVersion(value ? terms.data!.version : null);
                        }
                      }}
                    >
                      <Text className="font-poppins text-sm text-[#253044]">
                        Li e aceito os termos de uso.
                      </Text>
                    </Checkbox>

                    {error && (
                      <Text
                        accessibilityRole="alert"
                        className="font-poppins text-sm text-red-600"
                      >
                        {error}
                      </Text>
                    )}

                    <Button
                      disabled={
                        checkedVersion !== terms.data.version || submitting
                      }
                      isLoading={submitting}
                      text="Prosseguir"
                      onPress={accept}
                    />
                  </View>
                </>
              )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};
