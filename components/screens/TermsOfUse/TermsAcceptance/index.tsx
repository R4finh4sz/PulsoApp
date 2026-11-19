import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
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
  const scrollRef = useRef<ScrollView>(null);
  const [tab, setTabState] = useState<'terms' | 'privacy'>('terms');
  const setTab = (value: 'terms' | 'privacy') => {
    setTabState(value);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };
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
        setTab('terms');
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
        ref={scrollRef}
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 20,
        }}
      >
        <View className="w-full max-w-[560px] self-center">
          <TermsOfUseHeader
            title={
              tab === 'privacy' && privacy.data
                ? privacy.data.title
                : terms.data?.title
            }
          >
            {terms.data && privacy.data && !loadError && (
              <View accessibilityRole="tablist" className="flex-row gap-2">
                {(
                  [
                    ['terms', studentTerm ? 'Termo do Estudante' : 'Termos'],
                    ['privacy', 'Privacidade'],
                  ] as const
                ).map(([key, label]) => (
                  <Pressable
                    key={key}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: tab === key }}
                    className={`flex-1 items-center rounded-full border py-2 ${
                      tab === key
                        ? 'border-primary-100 bg-primary-100'
                        : 'border-[#d1d0d0] bg-white'
                    }`}
                    onPress={() => setTab(key)}
                  >
                    <Text
                      className={`font-poppins_semibold text-sm ${
                        tab === key ? 'text-white' : 'text-[#253044]'
                      }`}
                    >
                      {label}

                      {(key === 'terms'
                        ? checkedVersion === terms.data.version
                        : checkedPrivacyVersion === privacy.data.version) &&
                        ' ✓'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </TermsOfUseHeader>

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
                {tab === 'terms' ? (
                  <>
                    <TermsOfUseContent content={terms.data.content} />

                    <Text className="my-4 text-center font-poppins text-xs text-[#70839D]">
                      Versão {terms.data.version}
                    </Text>

                    <View className="px-6">
                      <Checkbox
                        checked={checkedVersion === terms.data.version}
                        onToggle={value => {
                          if (!submitting) {
                            setCheckedVersion(
                              value ? terms.data!.version : null,
                            );
                          }
                        }}
                      >
                        <Text className="font-poppins text-sm text-[#253044]">
                          {studentTerm
                            ? 'Li e estou ciente do Termo do Estudante.'
                            : 'Li e concordo com o termo'}
                        </Text>
                      </Checkbox>

                      <Pressable
                        accessibilityRole="link"
                        className="mt-4 flex-row items-center gap-2 self-center"
                        onPress={() => setTab('privacy')}
                      >
                        <Text className="font-poppins_semibold text-sm text-primary-100">
                          Visualizar Política de Privacidade
                        </Text>

                        <ArrowRight color="#0095B3" size={20} />
                      </Pressable>
                    </View>
                  </>
                ) : (
                  <>
                    <TermsOfUseContent content={privacy.data.content} />

                    <Text className="my-4 text-center font-poppins text-xs text-[#70839D]">
                      Versão {privacy.data.version}
                    </Text>

                    <View className="px-6">
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

                      <Pressable
                        accessibilityRole="link"
                        className="mt-4 flex-row items-center gap-2 self-center"
                        onPress={() => setTab('terms')}
                      >
                        <ArrowLeft color="#0095B3" size={20} />

                        <Text className="font-poppins_semibold text-sm text-primary-100">
                          Visualizar{' '}
                          {studentTerm ? 'Termo do Estudante' : 'Termos de Uso'}
                        </Text>
                      </Pressable>
                    </View>
                  </>
                )}

                <View className="mt-6 gap-6 px-6">
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
