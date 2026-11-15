import api from '@/services/api';
import { activityService, StudentActivity } from '@/services/activities';
import { summarizeActivities } from '@/utils/studentActivities';

jest.mock('@/services/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));

it('recupera a entrega existente após conflito sem reenviar as respostas', async () => {
  const error = { isAxiosError: true, response: { status: 409 } };
  const submission = { id: 7, activityId: 2 };
  jest.mocked(api.post).mockRejectedValueOnce(error);
  jest.mocked(api.get).mockResolvedValueOnce({
    data: [{ activity: { id: 2 }, submission }],
  });
  await expect(activityService.submit('2', [0, 1])).resolves.toEqual(
    submission,
  );
  expect(api.get).toHaveBeenCalledWith('/student/activities');
  expect(api.post).toHaveBeenCalledTimes(1);
});

it.each([409, 500])('preserva erro %i sem entrega confirmada', async status => {
  const error = { isAxiosError: true, response: { status } };
  jest.mocked(api.post).mockRejectedValueOnce(error);
  jest.mocked(api.get).mockResolvedValue({
    data: [{ activity: { id: 2 }, submission: null }],
  });
  await expect(activityService.submit('2', [0, 1])).rejects.toBe(error);
  expect(api.get).toHaveBeenCalledTimes(status === 409 ? 1 : 0);
});

it('não confirma entrega de outra atividade após conflito', async () => {
  const error = { isAxiosError: true, response: { status: 409 } };
  jest.mocked(api.post).mockRejectedValueOnce(error);
  jest.mocked(api.get).mockResolvedValueOnce({
    data: [{ activity: { id: 3 }, submission: { id: 8 } }],
  });
  await expect(activityService.submit('2', [0, 1])).rejects.toBe(error);
});

it('usa as rotas de aluno e envia somente as respostas', async () => {
  jest.mocked(api.get).mockResolvedValue({ data: [] });
  jest.mocked(api.post).mockResolvedValue({ data: { id: 7 } });
  await activityService.list();
  await activityService.quiz('2');
  await activityService.submit('2', [0, 1]);
  await activityService.result(7);
  expect(api.get).toHaveBeenCalledWith('/student/activities');
  expect(api.get).toHaveBeenCalledWith('/activities/2/quiz');
  expect(api.post).toHaveBeenCalledWith('/activities/2/submissions', {
    answers: [0, 1],
  });
  expect(api.get).toHaveBeenCalledWith('/submissions/7/result');
});

it('separa pendências, entregas e notas corrigidas, incluindo nota zero', () => {
  const items = [
    null,
    { gradedAt: null, score: null },
    { gradedAt: '2026-01-01', score: 0 },
    { gradedAt: '2026-01-01', score: 80 },
  ].map(submission => ({
    activity: { status: 'OPEN' },
    submission,
  })) as StudentActivity[];
  expect(summarizeActivities(items)).toEqual({
    completed: 3,
    pending: 1,
    graded: 2,
    percentage: 40,
  });
  expect(summarizeActivities([]).percentage).toBe(0);
});

it('conta como pendente somente a atividade aberta sem entrega', () => {
  const items = [
    { activity: { status: 'OPEN' }, submission: null },
    { activity: { status: 'FINISHED' }, submission: null },
    {
      activity: { status: 'OPEN' },
      submission: { gradedAt: null, score: null },
    },
    {
      activity: { status: 'FINISHED' },
      submission: { gradedAt: null, score: null },
    },
  ] as StudentActivity[];
  expect(summarizeActivities(items)).toEqual({
    pending: 1,
    completed: 2,
    graded: 0,
    percentage: 0,
  });
});
