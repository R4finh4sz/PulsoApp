import { renderAsync, screen, userEvent } from '@testing-library/react-native';

import { ReportsContent } from '@/components/screens/Reports/ReportsContent';
import { useStudentActivities } from '@/hooks/useStudentActivities';

jest.mock('@/services/mock', () => ({ isMockEnabled: false }));
jest.mock('@/hooks/useStudentActivities', () => ({
  useStudentActivities: jest.fn(),
}));
jest.mock('@/hooks/useStudentClassrooms', () => ({
  useStudentClassrooms: () => ({ data: [] }),
}));

const refetch = jest.fn();
beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

it.each([undefined, null, []])(
  'orienta quando não há retorno (%#)',
  async data => {
    jest.mocked(useStudentActivities).mockReturnValue({ data } as never);
    await renderAsync(<ReportsContent />);
    expect(
      screen.getByText('Ainda não há desempenho para mostrar'),
    ).toBeOnTheScreen();
    expect(
      screen.getByText(/Você ainda não fez nenhuma atividade/),
    ).toBeOnTheScreen();
    expect(
      screen.getByLabelText('Estudante comemorando sua formatura'),
    ).toBeOnTheScreen();
    expect(screen.queryByText('Aproveitamento geral')).not.toBeOnTheScreen();
    expect(
      screen.queryByText('% de acerto por disciplina'),
    ).not.toBeOnTheScreen();
    expect(
      screen.queryByRole('button', { name: 'Ver atividades' }),
    ).not.toBeOnTheScreen();
  },
);

it('informa quando uma atividade feita aguarda correção', async () => {
  jest.mocked(useStudentActivities).mockReturnValue({
    data: [
      {
        activity: { subjectId: 1 },
        submission: { gradedAt: null, score: null },
      },
    ],
  } as never);
  await renderAsync(<ReportsContent />);
  expect(
    screen.getByText(/Suas atividades ainda aguardam correção/),
  ).toBeOnTheScreen();
  expect(
    screen.queryByText(/Você ainda não fez nenhuma atividade/),
  ).not.toBeOnTheScreen();
  expect(screen.queryByText('Aproveitamento geral')).not.toBeOnTheScreen();
});

it.each([0, 75])('preserva os resultados corrigidos com %i%%', async score => {
  jest.mocked(useStudentActivities).mockReturnValue({
    data: [
      {
        activity: { subjectId: 1 },
        submission: { gradedAt: '2026-11-02', score },
      },
    ],
  } as never);
  await renderAsync(<ReportsContent />);
  expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({
    now: score,
  });
  if (score === 0) {
    expect(screen.getByText('Vamos continuar praticando?')).toBeOnTheScreen();
  } else {
    expect(
      screen.queryByText('Vamos continuar praticando?'),
    ).not.toBeOnTheScreen();
  }
});

it('mantém carregamento e permite tentar novamente após erro', async () => {
  jest
    .mocked(useStudentActivities)
    .mockReturnValue({ isPending: true } as never);
  const view = await renderAsync(<ReportsContent />);
  expect(screen.getByLabelText('Carregando relatório')).toBeOnTheScreen();
  expect(
    screen.queryByText('Ainda não há desempenho para mostrar'),
  ).not.toBeOnTheScreen();
  jest
    .mocked(useStudentActivities)
    .mockReturnValue({ isError: true, refetch } as never);
  await view.rerenderAsync(<ReportsContent />);
  await userEvent
    .setup()
    .press(screen.getByRole('button', { name: 'Tentar novamente' }));
  expect(refetch).toHaveBeenCalled();
});
