import api from '@/services/api';
import { rankingService } from '@/services/rankings';

jest.mock('@/services/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));
jest.mock('@/services/mock', () => ({ isMockEnabled: false }));

it.each([undefined, 1])(
  'consulta o ranking com schoolId=%s sem alterar a classificação',
  async schoolId => {
    const items = [
      {
        position: 2,
        studentId: 25,
        studentName: 'Bruno Souza',
        accuracyPercentage: 80,
      },
    ];
    const params = {
      year: 2026,
      bimester: 4,
      ...(schoolId ? { schoolId } : {}),
    };
    const { signal } = new AbortController();
    jest.mocked(api.get).mockResolvedValue({ data: items });
    await expect(rankingService.list(params, signal)).resolves.toEqual(items);
    expect(api.get).toHaveBeenCalledWith('/rankings/students', {
      params,
      signal,
    });
  },
);

it('propaga falhas da API', async () => {
  const error = new Error('Offline');
  jest.mocked(api.get).mockRejectedValueOnce(error);
  await expect(rankingService.list({ year: 2026, bimester: 4 })).rejects.toBe(
    error,
  );
});
