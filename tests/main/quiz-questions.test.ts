import { QuizActivity } from '@/components/screens/Quiz/mock';
import {
  calculateResult,
  getQuestions,
} from '@/components/screens/Quiz/questions';

it.each([
  ['reading', 'Interpretação'],
  ['science', 'Química'],
  ['math', 'Geometria'],
  ['math', 'Função 2º grau'],
  ['math', 'Sistema linear'],
  ['math', 'Função afim'],
])('gera questões e corrige o gabarito para %s / %s', (kind, title) => {
  const questions = getQuestions({
    kind,
    title,
    questions: 10,
  } as QuizActivity);
  expect(questions).toHaveLength(10);
  questions.forEach(question => {
    expect(question.prompt).toBeTruthy();
    expect(question.options).toHaveLength(4);
    expect(question.options[question.correct]).toBeTruthy();
  });
  expect(
    calculateResult(
      questions,
      questions.map(question => question.correct),
    ),
  ).toMatchObject({ correct: 10, total: 10, percentage: 100 });
  expect(
    calculateResult(
      questions,
      questions.map(question => (question.correct + 1) % 4),
    ).percentage,
  ).toBe(0);
});

it.each([
  [0, 1],
  [1, 1],
  [50, 10],
])('limita %s questões a %s', (questions, count) => {
  expect(
    getQuestions({ kind: 'math', title: 'Função', questions } as QuizActivity),
  ).toHaveLength(count);
});

it('calcula o percentual total e por conteúdo sem contar respostas ausentes', () => {
  const questions = [
    { prompt: '1', content: 'Área', options: ['1', '2'], correct: 0 },
    { prompt: '2', content: 'Área', options: ['1', '2'], correct: 1 },
    { prompt: '3', content: 'Perímetro', options: ['1', '2'], correct: 0 },
  ];
  expect(calculateResult(questions, [0, 0])).toEqual({
    correct: 1,
    total: 3,
    percentage: 33,
    contents: [
      { name: 'Área', percentage: 50 },
      { name: 'Perímetro', percentage: 0 },
    ],
  });
});
