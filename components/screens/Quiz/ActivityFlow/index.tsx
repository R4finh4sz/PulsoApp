import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActivityComplete } from '@/components/screens/Quiz/ActivityComplete';
import { ActivityDetails } from '@/components/screens/Quiz/ActivityDetails';
import {
  ActivityHeader,
  ActivityStage,
} from '@/components/screens/Quiz/ActivityHeader';
import { ActivityQuestion } from '@/components/screens/Quiz/ActivityQuestion';
import { ActivityResult } from '@/components/screens/Quiz/ActivityResult';
import { QuizActivity, quizMock } from '@/components/screens/Quiz/mock';
import {
  calculateResult,
  getQuestions,
  QuizQuestion,
} from '@/components/screens/Quiz/questions';
import Button from '@/components/ui/Button';
import ModalBackdrop from '@/components/ui/Modals/ModalBackdrop';
import useAuth from '@/contexts/Auth/useAuth';
import { useStudentActivities } from '@/hooks/useStudentActivities';
import { activityService, Quiz, Submission } from '@/services/activities';
import { isMockEnabled } from '@/services/mock';
import { useQuizStore } from '@/store/quizStore';

const home = () => router.replace('/(main)/Home');
const back = () =>
  router.canGoBack() ? router.back() : router.replace('/(main)/Quiz');

export const ActivityFlow = ({
  id,
  remoteQuiz,
  remoteSubmission,
}: {
  id: string;
  remoteQuiz?: Quiz;
  remoteSubmission?: Submission | null;
}) => {
  const queryClient = useQueryClient();
  const submit = useMutation({
    mutationFn: (answers: number[]) => activityService.submit(id, answers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-activities'] });
      setScreen('complete');
    },
  });
  const submission = submit.data ?? remoteSubmission;
  const resultQuery = useQuery({
    queryKey: ['submission-result', submission?.id],
    enabled: !!submission && !isMockEnabled,
    queryFn: () => activityService.result(submission!.id),
  });

  const { user } = useAuth();
  let activity: QuizActivity | undefined;
  if (isMockEnabled) {
    activity = quizMock.find(
      item => item.id === id && item.classroomId === user?.classroomId,
    );
  } else if (remoteQuiz) {
    activity = {
      id,
      classroomId: remoteQuiz.activity.classroomId,
      schoolCourseId: remoteQuiz.activity.subjectId,
      schoolCourse: 'Disciplina',
      teacher: '',
      title: `Atividade ${id}`,
      questions: remoteQuiz.activity.questionCount,
      daysLeft: 0,
      kind: 'reading' as const,
      completed: !!remoteSubmission,
    };
  }
  const key = `${user?.id}:${id}`;
  const draft = useQuizStore(state => state.answers[key]);
  const saved = useQuizStore(state => state.results[key]);
  const answer = useQuizStore(state => state.answer);
  const finish = useQuizStore(state => state.finish);
  const [screen, setScreen] = useState<ActivityStage>(
    activity?.completed || saved ? 'result' : 'details',
  );
  const [step, setStep] = useState(0);
  const [exitOpen, setExitOpen] = useState(false);
  let questions: QuizQuestion[] = [];
  if (remoteQuiz) {
    questions = remoteQuiz.questions.map(q => ({
      prompt: q.question,
      content: q.theme,
      options: q.options,
      correct: -1,
    }));
  } else if (activity) {
    questions = getQuestions(activity);
  }
  const answers = draft ?? [];
  // Resultados anteriores são exemplos apenas no modo de demonstração.
  const resultAnswers =
    saved ??
    (activity?.completed
      ? questions.map((question, index) =>
          index < 8 ? question.correct : (question.correct + 1) % 4,
        )
      : []);
  const mockResult = questions.length
    ? calculateResult(questions, resultAnswers)
    : undefined;
  const serverResult = resultQuery.data ?? submission;
  let result: ReturnType<typeof calculateResult> | undefined;
  if (isMockEnabled) {
    result = mockResult;
  } else if (serverResult?.gradedAt) {
    result = {
      percentage: serverResult.score ?? 0,
      correct: serverResult.correctAnswers ?? 0,
      total: serverResult.questionCount,
      contents: (serverResult.themePerformance ?? []).map(item => ({
        name: item.theme,
        percentage: item.percentage,
      })),
    };
  }
  const closed =
    !!remoteQuiz &&
    (remoteQuiz.activity.status === 'FINISHED' ||
      (!!remoteQuiz.activity.closesAt &&
        new Date(remoteQuiz.activity.closesAt).getTime() <= Date.now()));
  let startLabel = 'Iniciar';
  if (closed) {
    startLabel = 'Prazo encerrado';
  } else if (draft?.length) {
    startLabel = 'Continuar';
  }
  const question = questions[step];
  const close = () => (screen === 'quiz' ? setExitOpen(true) : back());

  return (
    <SafeAreaView className="flex-1 bg-neutral-background">
      <View className="w-full max-w-[560px] flex-1 self-center px-5 pb-5 pt-4">
        <ActivityHeader
          screen={screen}
          step={step}
          total={questions.length}
          onClose={close}
        />

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
                <ActivityDetails activity={activity} questions={questions} />
              )}

              {screen === 'quiz' && question && (
                <ActivityQuestion
                  question={question}
                  selected={answers[step]}
                  step={step}
                  onAnswer={index => answer(key, step, index)}
                />
              )}

              {screen === 'complete' && <ActivityComplete />}

              {screen === 'result' && !isMockEnabled && !result && (
                <View className="gap-3 py-8">
                  {resultQuery.isPending && (
                    <ActivityIndicator
                      accessibilityLabel="Carregando resultado"
                      color="#0095B3"
                    />
                  )}

                  <Text>
                    {resultQuery.isError
                      ? 'Não foi possível carregar o resultado.'
                      : 'Atividade enviada. Aguardando correção do professor.'}
                  </Text>

                  <Button
                    text="Atualizar resultado"
                    onPress={() => {
                      resultQuery.refetch();
                    }}
                  />
                </View>
              )}

              {screen === 'result' && result && (
                <ActivityResult result={result} />
              )}
            </ScrollView>

            {exitOpen ? (
              <Modal
                transparent
                animationType="fade"
                onRequestClose={() => setExitOpen(false)}
              >
                <ModalBackdrop
                  variant="error"
                  title="Sair do quiz?"
                  message="Suas respostas ficam salvas durante esta sessão."
                  buttons={[
                    { text: 'Sair', onPress: back },
                    {
                      text: 'Continuar',
                      wired: true,
                      onPress: () => setExitOpen(false),
                    },
                  ]}
                  onClose={() => setExitOpen(false)}
                />
              </Modal>
            ) : (
              <View className="gap-3 pt-3">
                {submit.isError && (
                  <Text accessibilityRole="alert">
                    Não foi possível enviar. Suas respostas foram preservadas.
                    Confira a entrega na lista de atividades antes de tentar
                    novamente.
                  </Text>
                )}

                {screen === 'details' && (
                  <Button
                    disabled={closed || !questions.length}
                    text={startLabel}
                    onPress={() => setScreen('quiz')}
                  />
                )}

                {screen === 'quiz' && (
                  <>
                    <Button
                      disabled={answers[step] === undefined || submit.isPending}
                      isLoading={submit.isPending}
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
                          if (isMockEnabled) {
                            finish(key);
                            setScreen('complete');
                          } else {
                            submit.mutate(answers);
                          }
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

export const RemoteActivity = ({ id }: { id: string }) => {
  const activities = useStudentActivities();
  const quiz = useQuery({
    queryKey: ['activity-quiz', id],
    queryFn: () => activityService.quiz(id),
  });
  if (quiz.isPending || activities.isPending) {
    return (
      <SafeAreaView className="flex-1 justify-center">
        <ActivityIndicator
          accessibilityLabel="Carregando atividade"
          color="#0095B3"
        />
      </SafeAreaView>
    );
  }
  if (quiz.isError || activities.isError) {
    return (
      <SafeAreaView className="flex-1 justify-center gap-4 p-5">
        <Text>Não foi possível carregar a atividade.</Text>

        <Button
          text="Tentar novamente"
          onPress={() => {
            quiz.refetch();
            activities.refetch();
          }}
        />

        <Button text="Voltar" onPress={back} />
      </SafeAreaView>
    );
  }
  return (
    <ActivityFlow
      id={id}
      remoteQuiz={quiz.data}
      remoteSubmission={
        activities.data?.find(item => String(item.activity.id) === id)
          ?.submission
      }
    />
  );
};
