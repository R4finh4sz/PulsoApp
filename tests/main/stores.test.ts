import { useErrorModal } from '@/store/errorModalStore';
import { useQuizStore } from '@/store/quizStore';

beforeEach(() => {
  useQuizStore.setState({ answers: {}, results: {} });
  useErrorModal.getState().closeErrorModal();
});

it('isola respostas por aluno/atividade e preserva o resultado finalizado', () => {
  const quiz = useQuizStore.getState();
  quiz.answer('student1:activity1', 0, 2);
  quiz.answer('student2:activity1', 0, 1);
  quiz.finish('student1:activity1');
  quiz.answer('student1:activity1', 0, 3);
  expect(useQuizStore.getState().answers).toEqual({
    'student1:activity1': [3],
    'student2:activity1': [1],
  });
  expect(useQuizStore.getState().results).toEqual({
    'student1:activity1': [2],
  });
});

it('finaliza atividade sem respostas como resultado vazio', () => {
  useQuizStore.getState().finish('empty');
  expect(useQuizStore.getState().results.empty).toEqual([]);
});

it('abre o modal com a mensagem da exceção e limpa ao fechar', () => {
  useErrorModal
    .getState()
    .openErrorFromException(new Error('Sessão expirada'), { title: 'Erro' });
  expect(useErrorModal.getState().modal).toEqual({
    title: 'Erro',
    message: 'Sessão expirada',
  });
  useErrorModal.getState().closeErrorModal();
  expect(useErrorModal.getState().modal).toBeNull();
});
