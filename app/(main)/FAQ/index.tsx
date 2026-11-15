import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ChevronDown, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Pressable from '@/components/ui/Pressable';
import useAuth from '@/contexts/Auth/useAuth';
import { shadow } from '@/global/shadow';
import { faqService } from '@/services/faq';

const FAQScreen = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const query = useQuery({
    queryKey: ['faqs', user?.id],
    enabled: !!user,
    queryFn: ({ signal }) => faqService.list(signal),
  });
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <ScrollView
      className="flex-1 bg-neutral-background"
      contentContainerClassName="grow px-6"
      contentContainerStyle={{
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 32,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View className="w-full max-w-[560px] self-center">
        <BackButton
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.replace('/(main)/Profile')
          }
        />

        <Text
          accessibilityRole="header"
          className="mt-9 text-center font-poppins_bold text-xl text-[#253044]"
        >
          FAQ
        </Text>

        <Text className="mt-6 px-4 text-center font-poppins text-sm leading-5 text-[#70839D]">
          Encontre respostas para as dúvidas mais frequentes sobre a plataforma.
          Consulte as perguntas e respostas disponíveis para entender melhor as
          funcionalidades e como utilizá-las.
        </Text>

        <View className="mt-10 gap-4">
          {query.isPending && (
            <ActivityIndicator
              accessibilityLabel="Carregando FAQ"
              color="#006D83"
            />
          )}

          {query.isError && (
            <View className="gap-3">
              <Text
                accessibilityRole="alert"
                className="font-poppins text-sm text-[#455165]"
              >
                Não foi possível carregar as perguntas frequentes.
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

          {query.isSuccess && !query.data.length && (
            <Text className="text-center font-poppins text-sm text-[#70839D]">
              Nenhuma pergunta disponível no momento.
            </Text>
          )}

          {query.data?.map(({ id, title, message }, index) => {
            const isExpanded = expanded === index;
            const Chevron = isExpanded ? ChevronDown : ChevronRight;
            return (
              <View
                key={id}
                className="rounded-[14px] bg-white"
                style={shadow.default}
              >
                <Pressable
                  accessibilityLabel={title}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: isExpanded }}
                  className="min-h-[48px] flex-row items-center gap-3 px-4 py-3"
                  onPress={() => setExpanded(isExpanded ? null : index)}
                >
                  <Text className="flex-1 font-poppins_semibold text-sm text-[#253044]">
                    {title}
                  </Text>

                  <Chevron
                    color={isExpanded ? '#0095B3' : '#9CA3AF'}
                    size={20}
                    strokeWidth={1.7}
                  />
                </Pressable>

                {isExpanded && (
                  <Text className="px-4 pb-5 font-poppins text-sm leading-5 text-[#70839D]">
                    {message}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

export default FAQScreen;
