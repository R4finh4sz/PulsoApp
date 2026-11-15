import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TermsAcceptance } from '@/components/screens/TermsOfUse/TermsAcceptance';
import { TermsOfUseContent } from '@/components/screens/TermsOfUse/TermsOfUseContent';
import { TermsOfUseHeader } from '@/components/screens/TermsOfUse/TermsOfUseHeader';
import Button from '@/components/ui/Button';
import useAuth from '@/contexts/Auth/useAuth';
import { termsService, usesStudentTerm } from '@/services/terms';
import { getErrorMessage } from '@/utils/getErrorMessage';

const PublishedTermsScreen = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const studentTerm = usesStudentTerm(user?.birthDate);
  const terms = useQuery({
    queryKey: ['terms', 'current', studentTerm],
    queryFn: () => termsService.current(studentTerm),
  });
  const privacy = useQuery({
    queryKey: ['terms', 'privacy'],
    queryFn: termsService.privacy,
  });

  return (
    <View className="flex-1 bg-neutral-background">
      <ScrollView
        contentContainerClassName="grow px-5"
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-[560px] self-center">
          <TermsOfUseHeader title={terms.data?.title} />

          {terms.isPending && <ActivityIndicator />}

          {terms.error && (
            <View className="gap-4">
              <Text>
                {getErrorMessage(
                  terms.error,
                  'Não foi possível carregar os termos.',
                )}
              </Text>

              <Button
                text="Tentar novamente"
                onPress={() => {
                  terms.refetch();
                }}
              />
            </View>
          )}

          {!terms.isPending && !terms.error && terms.data && (
            <TermsOfUseContent content={terms.data.content} />
          )}

          <View className="mt-8 gap-4">
            <Text
              accessibilityRole="header"
              className="font-poppins_semibold text-lg text-neutral-80"
            >
              {privacy.data?.title ?? 'Política de Privacidade'}
            </Text>

            {privacy.isPending && (
              <ActivityIndicator accessibilityLabel="Carregando política de privacidade" />
            )}

            {privacy.error && (
              <>
                <Text>
                  {getErrorMessage(
                    privacy.error,
                    'Não foi possível carregar a política de privacidade.',
                  )}
                </Text>

                <Button
                  text="Tentar carregar política novamente"
                  onPress={() => {
                    privacy.refetch();
                  }}
                />
              </>
            )}

            {!privacy.isPending && !privacy.error && privacy.data && (
              <TermsOfUseContent content={privacy.data.content} />
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const TermsOfUseScreen = () => {
  const { user } = useAuth();
  return user?.termsAccepted === true ? (
    <PublishedTermsScreen />
  ) : (
    <TermsAcceptance />
  );
};

export default TermsOfUseScreen;
