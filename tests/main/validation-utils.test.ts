import { formatCurrency, normalize } from '@/utils/format';
import { getErrorMessage } from '@/utils/getErrorMessage';

it('remove a máscara e preserva zeros iniciais', () => {
  expect(normalize('(011) 01234-5678')).toBe('011012345678');
  expect(normalize('abc')).toBe('');
});

it('formata valores em reais com duas casas decimais', () => {
  expect(formatCurrency(1234.5).replace(/\s/g, ' ')).toBe('R$ 1.234,50');
  expect(formatCurrency(0).replace(/\s/g, ' ')).toBe('R$ 0,00');
});

it.each([
  [
    {
      isAxiosError: true,
      response: {
        data: { error: { message: ' Detalhe ' }, message: 'Genérico' },
      },
    },
    'Detalhe',
  ],
  [{ isAxiosError: true, response: { data: { error: 'Falha' } } }, 'Falha'],
  [
    { isAxiosError: true, response: { data: { message: 'Mensagem' } } },
    'Mensagem',
  ],
  [new Error(' Local '), 'Local'],
  [' Texto ', 'Texto'],
  [null, 'Fallback'],
  ['  ', 'Fallback'],
  [{ isAxiosError: true }, 'Fallback'],
])('extrai a mensagem de erro ou usa o fallback (%#)', (error, expected) => {
  expect(getErrorMessage(error, 'Fallback')).toBe(expected);
});
