import api from '@/services/api';
import { faqService } from '@/services/faq';

jest.mock('@/services/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

it('consulta o FAQ pelo cliente autenticado e encaminha cancelamento', async () => {
  const items = [
    { id: 3, title: 'Pergunta', message: 'Resposta', targetRole: 'STUDENT' },
  ];
  const { signal } = new AbortController();
  jest.mocked(api.get).mockResolvedValue({ data: items });
  await expect(faqService.list(signal)).resolves.toEqual(items);
  expect(api.get).toHaveBeenCalledWith('/faqs', { signal });
});

it('propaga a falha sem substituir por perguntas mockadas', async () => {
  const error = new Error('Offline');
  jest.mocked(api.get).mockRejectedValueOnce(error);
  await expect(faqService.list()).rejects.toBe(error);
});
