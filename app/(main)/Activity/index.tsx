import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle2, Clock3, ListChecks } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SuccessImage from '@/assets/images/SucessInQuiz.png';
import { quizMock } from '@/components/screens/Quiz/mock';
import {
  calculateResult,
  getQuestions,
} from '@/components/screens/Quiz/questions';
import { BackButton } from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Image from '@/components/ui/Image';
import Pressable from '@/components/ui/Pressable';
import useAuth from '@/contexts/Auth/useAuth';
import { isMockEnabled } from '@/services/mock';
import { useQuizStore } from '@/store/quizStore';

const home = () => router.replace('/(main)/Home');
const back = () =>
  router.canGoBack() ? router.back() : router.replace('/(main)/Quiz');

const ActivityFlow = ({ id }: { id: string }) => {
  const { user } = useAuth();
  const activity = isMockEnabled
    ? quizMock.find(
        item => item.id === id && item.classroomId === user?.classroomId,
      )
    : undefined;
  const key = `${user?.id}:${id}`;
  const draft = useQuizStore(state => state.answers[key]);
  const saved = useQuizStore(state => state.results[key]);
  const answer = useQuizStore(state => state.answer);
  const finish = useQuizStore(state => state.finish);
  const [screen, setScreen] = useState<
    'details' | 'quiz' | 'complete' | 'result'
  >(activity?.completed || saved ? 'result' : 'details');
  const [step, setStep] = useState(0);
  const [exitOpen, setExitOpen] = useState(false);
  const questions = activity ? getQuestions(activity) : [];
  const answers = draft ?? [];
  // Resultados anteriores são exemplos apenas no modo de demonstração.
  const resultAnswers =
    saved ??
    (activity?.completed
      ? questions.map((question, index) =>
          index < 8 ? question.correct : (question.correct + 1) % 4,
        )
      : []);
  const result = questions.length
    ? calculateResult(questions, resultAnswers)
    : undefined;
  const question = questions[step];
  const close = () => (screen === 'quiz' ? setExitOpen(true) : back());

  return (
    <SafeAreaView className="flex-1 bg-neutral-background">
      <View className="w-full max-w-[560px] flex-1 self-center px-5 pb-5 pt-4">
        <View className="mb-3 min-h-12 flex-row items-center justify-between gap-3">
          <BackButton
            accessibilityLabel={screen === 'details' ? 'Voltar' : 'Fechar quiz'}
            label=""
            variant={screen === 'details' ? 'back' : 'close'}
            onPress={close}
          />

          <Text
            accessibilityRole="header"
            className="flex-1 text-center font-poppins_bold text-lg text-[#253044]"
          >
            {
              {
                details: 'Detalhes da atividade',
                quiz: 'Quiz',
                complete: '',
                result: '',
              }[screen]
            }
          </Text>

          {screen === 'quiz' ? (
            <Text className="rounded-lg border border-[#99CCD7] bg-[#E0E8EA] px-3 py-1 font-poppins_medium text-xs text-[#253044]">
              {`${step + 1}/${questions.length}`}
            </Text>
          ) : (
            <View className="w-5" />
          )}
        </View>

        {!activity ? (
          <View className="flex-1 justify-center gap-5">
            <Text className="text-center font-poppins text-[#253044]">
              Atividade não encontrada.
            </Text>

            <Button text="Voltar às atividades" onPress={back} />
          </View>
        ) : (
          <>
            {screen === 'quiz' && (
              <View
                accessible
                accessibilityRole="progressbar"
                accessibilityValue={{
                  min: 0,
                  max: questions.length,
                  now: step + 1,
                }}
                className="mb-5 h-2 overflow-hidden rounded-full bg-[#DCECF0]"
              >
                <View
                  className="h-full rounded-full bg-[#0095B3]"
                  style={{ width: `${((step + 1) / questions.length) * 100}%` }}
                />
              </View>
            )}

            <ScrollView
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
            >
              {screen === 'details' && (
                <View className="gap-6 pt-5">
                  <View className="gap-3 rounded-[20px] bg-[#008EAD] p-5">
                    <Text className="self-start rounded-full bg-white px-3 py-1 font-poppins_semibold text-[10px] text-[#253044]">
                      {activity.schoolCourse}
                    </Text>

                    <Text className="font-poppins_bold text-xl text-white">
                      {activity.title}
                    </Text>

                    <Text className="font-poppins text-xs text-white">
                      Atividade avaliativa
                    </Text>

                    <View className="flex-row gap-3">
                      {[
                        {
                          Icon: ListChecks,
                          label: `${questions.length} questões`,
                        },
                        { Icon: Clock3, label: `${questions.length} min` },
                      ].map(({ Icon, label }) => (
                        <View
                          key={label}
                          className="flex-row items-center gap-2 rounded-xl bg-white px-3 py-2"
                        >
                          <Icon color="#009DBD" size={15} />

                          <Text className="font-poppins text-xs text-[#253044]">
                            {label}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <Text className="font-poppins_bold text-sm text-[#253044]">
                    Instruções
                  </Text>

                  <View className="gap-4 px-3">
                    {[
                      'Leia cada enunciado com atenção antes de responder.',
                      'Cada questão possui apenas uma alternativa correta.',
                      'Você pode voltar e revisar antes de enviar suas respostas.',
                    ].map(text => (
                      <View key={text} className="flex-row gap-3">
                        <CheckCircle2 color="#22C55E" size={16} />

                        <Text className="flex-1 font-poppins text-xs text-[#455165]">
                          {text}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View className="gap-3">
                    <Text className="font-poppins_bold text-sm text-[#253044]">
                      Conteúdos avaliados
                    </Text>

                    <View className="flex-row flex-wrap gap-2">
                      {[...new Set(questions.map(item => item.content))].map(
                        content => (
                          <Text
                            key={content}
                            className="rounded-full bg-[#DDF7FD] px-3 py-2 font-poppins text-[11px] text-[#008EAD]"
                          >
                            {content}
                          </Text>
                        ),
                      )}
                    </View>
                  </View>

                  <View className="gap-4">
                    <Text className="font-poppins_bold text-sm text-[#253044]">
                      Habilidades avaliadas
                    </Text>

                    <Text className="px-3 font-poppins text-xs leading-5 text-[#455165]">
                      {
                        {
                          math: 'Interpretar situações-problema com conceitos matemáticos.\n\nAnalisar representações e aplicar estratégias de resolução.',
                          reading:
                            'Interpretar textos, identificar informações e realizar inferências.',
                          science:
                            'Identificar e comparar os tipos de ligações químicas.',
                        }[activity.kind]
                      }
                    </Text>
                  </View>
                </View>
              )}

              {screen === 'quiz' && question && (
                <View className="gap-6 pt-8">
                  <Text className="font-poppins_bold text-xs text-[#009DBD]">
                    Questão {step + 1}
                  </Text>

                  <Text
                    accessibilityRole="header"
                    className="font-poppins_medium text-base leading-6 text-[#354052]"
                  >
                    {question.prompt}
                  </Text>

                  <View accessibilityRole="radiogroup" className="gap-3">
                    {question.options.map((option, index) => (
                      <Pressable
                        key={option}
                        accessibilityLabel={`${String.fromCharCode(65 + index)}. ${option}`}
                        accessibilityRole="radio"
                        accessibilityState={{
                          checked: answers[step] === index,
                        }}
                        className={`min-h-16 flex-row items-center gap-3 rounded-xl border-2 p-4 ${answers[step] === index ? 'border-[#0095B3] bg-[#DDF7FD]' : 'border-transparent bg-[#D5D5D5]'}`}
                        onPress={() => answer(key, step, index)}
                      >
                        <View
                          className={`h-8 w-8 items-center justify-center rounded-full ${answers[step] === index ? 'bg-[#0095B3]' : 'bg-[#F7F7F7]'}`}
                        >
                          <Text
                            className={`font-poppins_semibold text-xs ${answers[step] === index ? 'text-white' : 'text-[#718096]'}`}
                          >
                            {String.fromCharCode(65 + index)}
                          </Text>
                        </View>

                        <Text className="flex-1 font-poppins_medium text-sm text-[#455165]">
                          {option}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              {screen === 'complete' && (
                <View className="flex-1 items-center justify-center gap-5 pt-8">
                  <Text
                    accessibilityRole="header"
                    className="text-center font-poppins_bold text-lg text-[#253044]"
                  >
                    Quiz concluído!
                  </Text>

                  <Text className="max-w-[340px] text-center font-poppins text-xs leading-5 text-[#455165]">
                    Você respondeu todas as questões deste quiz. Agora é hora de
                    conferir como foi o seu desempenho e descobrir o quanto você
                    aprendeu ao longo desta atividade.
                  </Text>

                  <Image
                    accessibilityLabel="Ilustração de conclusão do quiz"
                    contentFit="contain"
                    source={SuccessImage}
                    style={{ width: '100%', height: 300, marginTop: 12 }}
                  />
                </View>
              )}

              {screen === 'result' && result && (
                <View className="flex-1 items-center gap-5 pt-8">
                  <Text
                    accessibilityRole="header"
                    className="text-center font-poppins_bold text-lg text-[#253044]"
                  >
                    Resultado da atividade
                  </Text>

                  <View className="mt-6 h-36 w-36 items-center justify-center rounded-full border border-[#00A0C4]">
                    <Text className="font-poppins_bold text-[42px] text-[#0095B3]">
                      {result.percentage}%
                    </Text>
                  </View>

                  <View className="flex-row items-center gap-2 rounded-full bg-[#27CFF0] px-4 py-2">
                    <CheckCircle2 color="white" size={16} />

                    <Text className="font-poppins_semibold text-xs text-white">
                      {`${result.correct} de ${result.total} questões corretas`}
                    </Text>
                  </View>

                  <View className="mt-6 w-full gap-3">
                    <Text className="mb-1 font-poppins_bold text-sm text-[#253044]">
                      Desempenho por conteúdo
                    </Text>

                    {result.contents.map(content => {
                      let color = '#FF4D57';
                      if (content.percentage >= 70) {
                        color = '#22C55E';
                      } else if (content.percentage >= 40) {
                        color = '#F59E0B';
                      }
                      return (
                        <View
                          key={content.name}
                          className="gap-3 rounded-2xl bg-[#E3E3E3] p-4"
                        >
                          <View className="flex-row items-center justify-between gap-2">
                            <Text className="flex-1 font-poppins text-xs text-[#455165]">
                              {content.name}
                            </Text>

                            <Text
                              className="rounded-full bg-white px-3 py-1 font-poppins_semibold text-xs"
                              style={{ color }}
                            >
                              {content.percentage}%
                            </Text>
                          </View>

                          <View
                            accessible
                            accessibilityLabel={content.name}
                            accessibilityRole="progressbar"
                            accessibilityValue={{
                              min: 0,
                              max: 100,
                              now: content.percentage,
                            }}
                            className="h-2 overflow-hidden rounded-full bg-[#F1F5F9]"
                          >
                            <View
                              style={{
                                width: `${content.percentage}%`,
                                backgroundColor: color,
                                height: '100%',
                                borderRadius: 10,
                              }}
                            />
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
            </ScrollView>

            {exitOpen ? (
              <View className="gap-3 rounded-xl bg-[#E0F5FA] p-4">
                <Text className="font-poppins text-sm text-[#253044]">
                  Sair do quiz? Suas respostas ficam salvas durante esta sessão.
                </Text>

                <Button
                  text="Continuar respondendo"
                  onPress={() => setExitOpen(false)}
                />

                <Button wired text="Sair do quiz" onPress={back} />
              </View>
            ) : (
              <View className="gap-3 pt-3">
                {screen === 'details' && (
                  <Button
                    text={draft?.length ? 'Continuar' : 'Iniciar'}
                    onPress={() => setScreen('quiz')}
                  />
                )}

                {screen === 'quiz' && (
                  <>
                    <Button
                      disabled={answers[step] === undefined}
                      text={
                        step === questions.length - 1 ? 'Finalizar' : 'Próxima'
                      }
                      onPress={() => {
                        if (step < questions.length - 1) {
                          setStep(step + 1);
                        } else if (
                          questions.every(
                            (_, index) => answers[index] !== undefined,
                          )
                        ) {
                          finish(key);
                          setScreen('complete');
                        }
                      }}
                    />

                    {step > 0 && (
                      <Button
                        wired
                        text="Anterior"
                        onPress={() => setStep(step - 1)}
                      />
                    )}
                  </>
                )}

                {screen === 'complete' && (
                  <View className="flex-row gap-3">
                    <View className="flex-1">
                      <Button text="Ir para Home" onPress={home} />
                    </View>

                    <View className="flex-1">
                      <Button
                        text="Ver nota"
                        onPress={() => setScreen('result')}
                      />
                    </View>
                  </View>
                )}

                {screen === 'result' && (
                  <Button text="Ir para Home" onPress={home} />
                )}
              </View>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const ActivityScreen = () => {
  const { id, visit } = useLocalSearchParams<{ id: string; visit?: string }>();
  return <ActivityFlow key={`${id}-${visit}`} id={id} />;
};

export default ActivityScreen;
