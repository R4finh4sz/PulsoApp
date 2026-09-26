import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TermsOfUseContent } from '@/components/screens/TermsOfUse/TermsOfUseContent';
import { TermsOfUseHeader } from '@/components/screens/TermsOfUse/TermsOfUseHeader';
import Button from '@/components/ui/Button';
import { termsService } from '@/services/terms';
import { getErrorMessage } from '@/utils/getErrorMessage';

const TermsOfUseScreen = () => {
  const insets = useSafeAreaInsets();
  const terms = useQuery({
    queryKey: ['terms', 'current'],
    queryFn: termsService.current,
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
        </View>
      </ScrollView>
    </View>
  );
};

export default TermsOfUseScreen;
