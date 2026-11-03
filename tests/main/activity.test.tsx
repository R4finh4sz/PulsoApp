import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactElement } from 'react';
import { RefreshControl } from 'react-native';
// Quiz questions must be answered in order; each interaction depends on the previous screen.
/* eslint-disable no-await-in-loop */
import {
  act,
  fireEventAsync,
  renderAsync as renderNativeAsync,
  screen,
  userEvent,
  waitFor,
} from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';

import Activity from '@/app/(main)/Activity';
import Quiz from '@/app/(main)/Quiz';
import SchoolCourseActivities from '@/app/(main)/SchoolCourseActivities';
import { ActivityCard } from '@/components/screens/Quiz/ActivityCard';
import { quizMock } from '@/components/screens/Quiz/mock';
import { getQuestions } from '@/components/screens/Quiz/questions';
import useAuth from '@/contexts/Auth/useAuth';
import { useStudentActivities } from '@/hooks/useStudentActivities';
import { activityService, Submission } from '@/services/activities';
import { useQuizStore } from '@/store/quizStore';

const renderAsync = (ui: ReactElement) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return renderNativeAsync(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });
};
jest.mock('@/contexts/Auth/useAuth', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('@/services/mock', () => ({ isMockEnabled: true }));
jest.mock('@/hooks/useStudentActivities', () => ({
  useStudentActivities: jest.fn(() => ({ data: [] })),
}));
jest.mock('@/hooks/useStudentClassrooms', () => ({
  useStudentClassrooms: () => ({ data: [] }),
}));
const activity = quizMock.find(item => !item.completed)!;

beforeEach(() => {
  jest.useFakeTimers();
  jest.mocked(useAuth).mockReturnValue({
    user: { id: 1, classroomId: activity.classroomId },
  } as never);
  jest.mocked(useLocalSearchParams).mockReturnValue({ id: activity.id });
  useQuizStore.setState({ answers: {}, results: {} });
});
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

it('atualiza atividades ao puxar a lista vazia da matéria', async () => {
  jest.replaceProperty(
    jest.requireMock('@/services/mock'),
    'isMockEnabled',
    false,
  );
  const refetch = jest.fn();
  jest.mocked(useStudentActivities).mockReturnValue({
    data: [],
    isPending: false,
    isRefetching: false,
    refetch,
  } as never);
  await renderAsync(<SchoolCourseActivities />);
  expect(screen.getByText('Nenhuma atividade pendente.')).toBeOnTheScreen();
  await fireEventAsync(screen.UNSAFE_getByType(RefreshControl), 'refresh');
  expect(refetch).toHaveBeenCalledTimes(1);
});

it.each([true, false])(
  'envia o quiz real e só conclui após confirmação da API (sucesso: %s)',
  async success => {
    jest.replaceProperty(
      jest.requireMock('@/services/mock'),
      'isMockEnabled',
      false,
    );
    const questions = getQuestions(activity);
    const answers = questions.map(question => question.correct);
    useQuizStore.setState({
      answers: { [`1:${activity.id}`]: answers },
      results: {},
    });
    jest
      .mocked(useStudentActivities)
      .mockReturnValue({ data: [], isPending: false } as never);
    jest.spyOn(activityService, 'quiz').mockResolvedValue({
      activity: {
        id: Number(activity.id),
        classroomId: activity.classroomId,
        subjectId: 1,
        questionCount: questions.length,
        closesAt: null,
        status: 'OPEN',
      },
      questions: questions.map((question, index) => ({
        id: index,
        question: question.prompt,
        options: question.options,
        theme: question.content,
      })),
    });
    let resolve!: (submission: Submission) => void;
    let reject!: (error: Error) => void;
    const submission = {
      id: 9,
      activityId: Number(activity.id),
      answers,
      gradedAt: null,
      correctAnswers: null,
      questionCount: questions.length,
      score: null,
      themePerformance: [],
    };
    const send = jest.spyOn(activityService, 'submit').mockReturnValue(
      new Promise((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
      }),
    );
    jest.spyOn(activityService, 'result').mockResolvedValue(submission);
    await renderAsync(<Activity />);
    await fireEventAsync.press(await screen.findByText('Continuar'));
    for (let index = 0; index < questions.length; index += 1) {
      act(() => jest.advanceTimersByTime(1100));
      await fireEventAsync.press(
        screen.getByText(
          index === questions.length - 1 ? 'Finalizar' : 'Próxima',
        ),
      );
    }
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(activity.id, answers);
    expect(screen.queryByText('Quiz concluído!')).not.toBeOnTheScreen();
    await act(async () => {
      if (success) resolve(submission);
      else reject(new Error('Offline'));
    });
    if (success) {
      await waitFor(() =>
        expect(screen.getByText('Quiz concluído!')).toBeOnTheScreen(),
      );
    } else {
      await waitFor(() =>
        expect(screen.getByRole('alert')).toHaveTextContent(
          /Não foi possível enviar/,
        ),
      );
      expect(screen.queryByText('Quiz concluído!')).not.toBeOnTheScreen();
    }
    expect(useQuizStore.getState().answers[`1:${activity.id}`]).toEqual(
      answers,
    );
    expect(useQuizStore.getState().results[`1:${activity.id}`]).toBeUndefined();
  },
);

it('lista e conta apenas abertas sem entrega como pendentes, preservando as entregas nas concluídas', async () => {
  jest.replaceProperty(
    jest.requireMock('@/services/mock'),
    'isMockEnabled',
    false,
  );
  const data = [
    { status: 'OPEN', submission: null },
    { status: 'FINISHED', submission: null },
    { status: 'OPEN', submission: { id: 10 } },
    { status: 'FINISHED', submission: { id: 11 } },
  ].map(({ status, submission }, index) => ({
    activity: {
      id: 101 + index,
      status,
      classroomId: activity.classroomId,
      subjectId: 1,
      questionCount: 10,
      closesAt: null,
    },
    submission,
  }));
  jest.mocked(useStudentActivities).mockReturnValue({ data } as never);
  await renderAsync(<Quiz />);
  expect(screen.getByText('Atividade 101')).toBeOnTheScreen();
  expect(screen.queryByText('Atividade 102')).not.toBeOnTheScreen();
  expect(screen.queryByText('Atividade 103')).not.toBeOnTheScreen();
  expect(screen.getByRole('tab', { name: /Pendentes/ })).toHaveTextContent(
    /Pendentes1/,
  );
  expect(screen.getByRole('tab', { name: /Concluídas/ })).toHaveTextContent(
    /Concluídas2/,
  );
  await fireEventAsync.press(screen.getByRole('tab', { name: /Concluídas/ }));
  expect(screen.getByText('Atividade 103')).toBeOnTheScreen();
  expect(screen.getByText('Atividade 104')).toBeOnTheScreen();
  expect(screen.queryByText('Atividade 102')).not.toBeOnTheScreen();
});

it('percorre questões, revisa resposta e finaliza com resultado correto', async () => {
  await renderAsync(<Activity />);
  expect(screen.getByText(activity.title)).toBeOnTheScreen();
  await fireEventAsync.press(screen.getByText('Iniciar'));
  const questions = getQuestions(activity);
  for (let index = 0; index < questions.length; index += 1) {
    expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({
      now: index + 1,
      max: questions.length,
    });
    await userEvent
      .setup()
      .press(screen.getAllByRole('radio')[questions[index].correct]);
    expect(
      screen.getAllByRole('radio')[questions[index].correct],
    ).toBeChecked();
    if (index === 1) {
      await fireEventAsync.press(screen.getByText('Anterior'));
      expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({
        now: 1,
      });
      act(() => jest.advanceTimersByTime(1100));
      // Select again to test revisiting a saved answer.
      await userEvent
        .setup()
        .press(screen.getAllByRole('radio')[questions[0].correct]);
      await fireEventAsync.press(screen.getByText('Próxima'));
    }
    act(() => jest.advanceTimersByTime(1100));
    await fireEventAsync.press(
      screen.getByText(
        index === questions.length - 1 ? 'Finalizar' : 'Próxima',
      ),
    );
  }
  expect(screen.getByText('Quiz concluído!')).toBeOnTheScreen();
  expect(useQuizStore.getState().results[`1:${activity.id}`]).toEqual(
    questions.map(q => q.correct),
  );
  await fireEventAsync.press(screen.getByText('Ver nota'));
  expect(screen.getByText('Resultado da atividade')).toBeOnTheScreen();
  expect(screen.getAllByText('100%').length).toBeGreaterThan(0);
  await fireEventAsync.press(screen.getByText('Ir para Home'));
  expect(router.replace).toHaveBeenCalledWith('/(main)/Home');
});

it('permite cancelar saída e mantém rascunho ao sair', async () => {
  await renderAsync(<Activity />);
  await fireEventAsync.press(screen.getByText('Iniciar'));
  await userEvent.setup().press(screen.getAllByRole('radio')[0]);
  await userEvent
    .setup()
    .press(screen.getByRole('button', { name: 'Fechar quiz' }));
  expect(
    screen.getByText('Suas respostas ficam salvas durante esta sessão.'),
  ).toBeOnTheScreen();
  expect(screen.getByText('Sair do quiz?')).toBeOnTheScreen();
  await fireEventAsync.press(screen.getByText('Continuar'));
  expect(screen.queryByText('Sair do quiz?')).not.toBeOnTheScreen();
  expect(screen.getAllByRole('radio')[0]).toBeChecked();
  await userEvent
    .setup()
    .press(screen.getByRole('button', { name: 'Fechar quiz' }));
  await fireEventAsync.press(screen.getByText('Sair'));
  expect(router.replace).toHaveBeenCalledWith('/(main)/Quiz');
  expect(useQuizStore.getState().answers[`1:${activity.id}`]).toEqual([0]);
});

it('mostra Continuar para rascunho e resultado salvo para atividade finalizada', async () => {
  useQuizStore.getState().answer(`1:${activity.id}`, 0, 0);
  const { rerenderAsync } = await renderAsync(<Activity />);
  expect(screen.getByText('Continuar')).toBeOnTheScreen();
  act(() => useQuizStore.getState().finish(`1:${activity.id}`));
  jest
    .mocked(useLocalSearchParams)
    .mockReturnValue({ id: activity.id, visit: 'new' });
  await rerenderAsync(<Activity />);
  expect(screen.getByText('Resultado da atividade')).toBeOnTheScreen();
  expect(screen.getAllByRole('progressbar').length).toBeGreaterThan(0);
});

it('informa atividade inexistente e volta pelo histórico', async () => {
  jest.mocked(useLocalSearchParams).mockReturnValue({ id: 'missing' });
  jest.mocked(router.canGoBack).mockReturnValue(true);
  await renderAsync(<Activity />);
  expect(screen.getByText('Atividade não encontrada.')).toBeOnTheScreen();
  await fireEventAsync.press(screen.getByText('Voltar às atividades'));
  expect(router.back).toHaveBeenCalled();
});

it('Quiz filtra atividades pendentes/concluídas e abre detalhes', async () => {
  await renderAsync(<Quiz />);
  await userEvent
    .setup()
    .press(
      screen.getByRole('button', { name: `Abrir atividade ${activity.title}` }),
    );
  expect(router.push).toHaveBeenCalledWith(
    expect.objectContaining({
      pathname: '/(main)/Activity',
      params: { id: activity.id, visit: expect.any(String) },
    }),
  );
  await fireEventAsync.press(screen.getByRole('tab', { name: /Concluídas/ }));
  expect(screen.getByRole('tab', { name: /Concluídas/ })).toBeSelected();
  expect(
    screen.queryByRole('button', { name: `Abrir atividade ${activity.title}` }),
  ).not.toBeOnTheScreen();
});

it('filtra por matéria e turma em SchoolCourseActivities', async () => {
  jest.mocked(useLocalSearchParams).mockReturnValue({
    schoolCourseId: String(activity.schoolCourseId),
    schoolCourseName: activity.schoolCourse,
    classroomId: String(activity.classroomId),
  });
  await renderAsync(<SchoolCourseActivities />);
  expect(screen.getByRole('header')).toHaveTextContent(
    `Atividades de ${activity.schoolCourse}`,
  );
  expect(screen.getByText(activity.title)).toBeOnTheScreen();
  await fireEventAsync.press(screen.getByRole('tab', { name: /Concluídas/ }));
  expect(screen.getByRole('tab', { name: /Concluídas/ })).toBeSelected();
});

it.each([
  [-1, 'Vencido'],
  [0, 'Prazo hoje'],
  [1, '1 dias'],
  [10, '10 dias'],
])('card mostra prazo %s', async (daysLeft, text) => {
  await renderAsync(
    <ActivityCard
      activity={{ ...activity, daysLeft }}
      schoolCourseOnly={false}
    />,
  );
  expect(screen.getByText(text)).toBeOnTheScreen();
});

it('card de matéria mostra Hoje e atividade concluída abre resultado', async () => {
  const { rerenderAsync } = await renderAsync(
    <ActivityCard schoolCourseOnly activity={{ ...activity, daysLeft: 0 }} />,
  );
  expect(screen.getByText('Hoje')).toBeOnTheScreen();
  await rerenderAsync(
    <ActivityCard
      schoolCourseOnly
      activity={{ ...activity, completed: true }}
    />,
  );
  expect(
    screen.getByRole('button', { name: `Ver resultado de ${activity.title}` }),
  ).toBeOnTheScreen();
});
