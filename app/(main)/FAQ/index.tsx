import { router } from 'expo-router';
import { ChevronDown, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/ui/BackButton';
import Pressable from '@/components/ui/Pressable';
import { shadow } from '@/global/shadow';

const questions = [
  {
    question: 'Como alterar minha senha?',
    answer:
      'No menu da conta, toque em “Alterar senha”. Informe sua senha atual, crie uma nova senha e confirme a alteração.',
  },
  {
    question: 'Esqueci minha senha. O que fazer?',
    answer:
      'Na tela de login, toque em “Esqueci minha senha” e siga as instruções para recuperar o acesso com seu e-mail.',
  },
  {
    question: 'Onde encontro minhas atividades?',
    answer:
      'Acesse a área de atividades pelo menu do aplicativo para consultar as atividades disponíveis.',
  },
  {
    question: 'Como consultar meu desempenho?',
    answer:
      'Acesse a área de relatórios pelo menu do aplicativo para acompanhar seu desempenho.',
  },
  {
    question: 'Onde posso ler os termos de uso?',
    answer:
      'No menu da conta, toque em “Termos de uso” para consultar o documento.',
  },
];

const FAQScreen = () => {
  const insets = useSafeAreaInsets();
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
          {questions.map(({ question, answer }, index) => {
            const isExpanded = expanded === index;
            const Chevron = isExpanded ? ChevronDown : ChevronRight;
            return (
              <View
                key={question}
                className="rounded-[14px] bg-white"
                style={shadow.default}
              >
                <Pressable
                  accessibilityLabel={question}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: isExpanded }}
                  className="min-h-[48px] flex-row items-center gap-3 px-4 py-3"
                  onPress={() => setExpanded(isExpanded ? null : index)}
                >
                  <Text className="flex-1 font-poppins_semibold text-sm text-[#253044]">
                    {question}
                  </Text>

                  <Chevron
                    color={isExpanded ? '#0095B3' : '#9CA3AF'}
                    size={20}
                    strokeWidth={1.7}
                  />
                </Pressable>

                {isExpanded && (
                  <Text className="px-4 pb-5 font-poppins text-sm leading-5 text-[#70839D]">
                    {answer}
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
