import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TermsOfUseContent } from '@/components/screens/TermsOfUse/TermsOfUseContent';
import { TermsOfUseHeader } from '@/components/screens/TermsOfUse/TermsOfUseHeader';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import useAuth from '@/contexts/Auth/useAuth';
import { termsService, usesStudentTerm } from '@/services/terms';
import { getErrorMessage } from '@/utils/getErrorMessage';

export const TermsAcceptance = () => {
  const { user, confirmTermsAcceptance } = useAuth();
  const studentTerm = usesStudentTerm(user?.birthDate);
  const insets = useSafeAreaInsets();
  const [checkedVersion, setCheckedVersion] = useState<string | null>(null);
  const [checkedPrivacyVersion, setCheckedPrivacyVersion] = useState<
    string | null
  >(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const terms = useQuery({
    queryKey: ['terms', 'current', studentTerm],
    queryFn: () => termsService.current(studentTerm),
  });
  const privacy = useQuery({
    queryKey: ['terms', 'privacy'],
    queryFn: termsService.privacy,
  });
  useEffect(() => {
    setCheckedVersion(null);
    setCheckedPrivacyVersion(null);
  }, [studentTerm]);
  const accept = async () => {
    if (
      !terms.data ||
      !privacy.data ||
      checkedVersion !== terms.data.version ||
      checkedPrivacyVersion !== privacy.data.version ||
      submitting ||
      terms.isFetching ||
      privacy.isFetching
    ) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await termsService.accept(terms.data.version, privacy.data.version);
      await confirmTermsAcceptance();
      router.replace('/(main)/Home');
    } catch (cause) {
      setError(
        getErrorMessage(
          cause,
          'Não foi possível salvar o aceite. Tente novamente.',
        ),
      );
      if (axios.isAxiosError(cause) && cause.response?.status === 409) {
        setCheckedVersion(null);
        setCheckedPrivacyVersion(null);
        await Promise.all([terms.refetch(), privacy.refetch()]);
      }
    } finally {
      setSubmitting(false);
    }
  };
  if (terms.isPending || privacy.isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-background">
        <ActivityIndicator
          accessibilityLabel="Verificando acesso"
          color="#0095B3"
        />
      </View>
    );
  }
  const loadError = terms.error || privacy.error;
  return (
    <View className="flex-1 bg-neutral-background">
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 20,
        }}
      >
        <View className="w-full max-w-[560px] self-center">
          <TermsOfUseHeader title={terms.data?.title} />

          <Text className="mb-6 text-center font-poppins text-sm text-[#70839D]">
            {studentTerm
              ? 'Leia o Termo do Estudante e a Política de Privacidade para continuar no Pulso.'
              : 'Leia os Termos Gerais e a Política de Privacidade para continuar no Pulso.'}
          </Text>

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
                  privacy.refetch();
                }}
              />
            </View>
          )}

          {!terms.isPending &&
            !privacy.isPending &&
            !loadError &&
            terms.data &&
            privacy.data && (
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
                      {studentTerm
                        ? 'Li e estou ciente do Termo do Estudante.'
                        : 'Li e concordo com o termo'}
                    </Text>
                  </Checkbox>

                  <Text
                    accessibilityRole="header"
                    className="font-poppins_semibold text-base text-[#253044]"
                  >
                    {privacy.data.title}
                  </Text>

                  <TermsOfUseContent content={privacy.data.content} />

                  <Text className="font-poppins text-xs text-[#70839D]">
                    Versão {privacy.data.version}
                  </Text>

                  <Checkbox
                    checked={checkedPrivacyVersion === privacy.data.version}
                    onToggle={value => {
                      if (!submitting) {
                        setCheckedPrivacyVersion(
                          value ? privacy.data!.version : null,
                        );
                      }
                    }}
                  >
                    <Text className="font-poppins text-sm text-[#253044]">
                      {studentTerm
                        ? 'Li e aceito a Política de Privacidade.'
                        : 'Li e concordo com a Política de Privacidade'}
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
                      checkedVersion !== terms.data.version ||
                      checkedPrivacyVersion !== privacy.data.version ||
                      submitting ||
                      terms.isFetching ||
                      privacy.isFetching
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
  );
};
