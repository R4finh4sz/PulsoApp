// Quiz questions must be answered in order; each interaction depends on the previous screen.
/* eslint-disable no-await-in-loop */
import {
  act,
  fireEventAsync,
  renderAsync,
  screen,
  userEvent,
} from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';

import Activity from '@/app/(main)/Activity';
import Quiz from '@/app/(main)/Quiz';
import SchoolCourseActivities from '@/app/(main)/SchoolCourseActivities';
import { ActivityCard } from '@/components/screens/Quiz/ActivityCard';
import { quizMock } from '@/components/screens/Quiz/mock';
import { getQuestions } from '@/components/screens/Quiz/questions';
import useAuth from '@/contexts/Auth/useAuth';
import { useQuizStore } from '@/store/quizStore';

jest.mock('@/contexts/Auth/useAuth', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('@/services/mock', () => ({ isMockEnabled: true }));
const activity = quizMock.find(item => !item.completed)!;

beforeEach(() => {
  jest.useFakeTimers();
  jest.mocked(useAuth).mockReturnValue({
    user: { id: 1, classroomId: activity.classroomId },
  } as never);
  jest.mocked(useLocalSearchParams).mockReturnValue({ id: activity.id });
  useQuizStore.setState({ answers: {}, results: {} });
});
afterEach(() => jest.useRealTimers());

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
    screen.getByText(
      'Sair do quiz? Suas respostas ficam salvas durante esta sessão.',
    ),
  ).toBeOnTheScreen();
  await fireEventAsync.press(screen.getByText('Continuar respondendo'));
  await userEvent
    .setup()
    .press(screen.getByRole('button', { name: 'Fechar quiz' }));
  await fireEventAsync.press(screen.getByText('Sair do quiz'));
  expect(router.replace).toHaveBeenCalledWith('/(main)/Quiz');
  expect(useQuizStore.getState().answers[`1:${activity.id}`]).toEqual([0]);
});

it('mostra Continuar para rascunho e resultado salvo para atividade finalizada', async () => {
  useQuizStore.getState().answer(`1:${activity.id}`, 0, 0);
  const { rerenderAsync } = await renderAsync(<Activity />);
  expect(screen.getByText('Continuar')).toBeOnTheScreen();
  useQuizStore.getState().finish(`1:${activity.id}`);
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
