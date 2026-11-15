import { create } from 'zustand';

type QuizStore = {
  answers: Record<string, number[]>;
  results: Record<string, number[]>;
  answer: (key: string, index: number, value: number) => void;
  finish: (key: string) => void;
};

// Estado da sessão, separado por aluno e atividade; a API ainda não está disponível.
export const useQuizStore = create<QuizStore>(set => ({
  answers: {},
  results: {},
  answer: (key, index, value) =>
    set(state => {
      const answers = [...(state.answers[key] ?? [])];
      answers[index] = value;
      return { answers: { ...state.answers, [key]: answers } };
    }),
  finish: key =>
    set(state => ({
      results: { ...state.results, [key]: [...(state.answers[key] ?? [])] },
    })),
}));
