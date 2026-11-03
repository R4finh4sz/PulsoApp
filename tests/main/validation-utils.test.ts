import {
  formatClassroom,
  formatCurrency,
  formatName,
  normalize,
} from '@/utils/format';
import { getErrorMessage } from '@/utils/getErrorMessage';

it.each([
  ['3 ano', 'A', '3º Ano A'],
  ['3 ano', 'B', '3º Ano B'],
  ['3 ano', 'C', '3º Ano C'],
  ['3 ano', 'D', '3º Ano D'],
  ['3º Ano B', '3B', '3º Ano B'],
  ['3 ano', '3c', '3º Ano C'],
  ['3 ano', undefined, '3º Ano'],
  ['Turma A', 'A', 'Turma A'],
])('formata turma %s / %s', (name, identifier, expected) => {
  expect(formatClassroom(name, identifier)).toBe(expected);
});

it.each([
  ['rafael silva', 'Rafael Silva'],
  ['ANA MARIA SILVA', 'Ana Maria Silva'],
  ['  joÃO   álVARES  ', 'João Álvares'],
  ['ana', 'Ana'],
  ['', ''],
  ['   ', ''],
])('formata o nome para exibição: %s', (name, expected) => {
  expect(formatName(name)).toBe(expected);
});

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
