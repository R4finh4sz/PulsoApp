import Toast from 'react-native-toast-message';

import { getDeadlineColor } from '@/utils/getDeadlineColor';
import {
  getTabBarIconName,
  isTabRoute,
  TAB_NAMES,
} from '@/utils/getTabBarIcons';
import { handleError, handleSuccess } from '@/utils/handleError';
import queryClient from '@/utils/queryClient';

jest.mock('react-native-toast-message', () => ({
  __esModule: true,
  default: { show: jest.fn() },
}));
beforeEach(() => jest.spyOn(console, 'log').mockImplementation(() => {}));
afterEach(() => jest.restoreAllMocks());

it.each([
  [-1, '#FF3434'],
  [2, '#FF3434'],
  [3, '#F5A000'],
  [7, '#F5A000'],
  [8, '#00A448'],
])('colore prazo de %s dias', (days, color) =>
  expect(getDeadlineColor(days)).toBe(color),
);

it('identifica as quatro abas e seus ícones', () => {
  expect(TAB_NAMES.map(getTabBarIconName)).toEqual([
    'HouseIcon',
    'TeamsIcon',
    'CheckListIcon',
    'GraphicIcon',
  ]);
  TAB_NAMES.forEach(tab => expect(isTabRoute(tab)).toBe(true));
  expect(isTabRoute('Profile')).toBe(false);
});

it.each([
  [
    'Too many requests, please try again later.',
    'Muitas requisições, tente mais tarde.',
  ],
  [
    'Your new password must be different',
    'Sua nova senha deve ser diferente da senha atual.',
  ],
  ['Passwords do not match', 'Senha atual inválida'],
  ['The provided current password', 'Senha atual inválida'],
  ['Invalid identifier or password', 'Dados inválidos'],
  ['Outra falha', 'Outra falha'],
])('traduz a mensagem da API %s', (message, expected) => {
  handleError({
    isAxiosError: true,
    response: { data: { error: { message } } },
  });
  expect(Toast.show).toHaveBeenCalledWith({ type: 'error', text1: expected });
});

it.each([
  new Error('Falha'),
  'Falha',
  { isAxiosError: true, response: { data: { message: 'Falha' } } },
])('apresenta mensagens de diferentes fontes (%#)', error => {
  handleError(error);
  expect(Toast.show).toHaveBeenCalledWith({ type: 'error', text1: 'Falha' });
});

it.each([
  undefined,
  { isAxiosError: true },
  { isAxiosError: true, response: { data: { message: 42 } } },
])('usa mensagem genérica para erro desconhecido (%#)', error => {
  handleError(error);
  expect(Toast.show).toHaveBeenCalledWith({
    type: 'error',
    text1: 'Houve um imprevisto, tente novamente mais tarde',
  });
});

it('exibe sucesso e trata erro de mutation com as opções do cliente', () => {
  handleSuccess('Salvo');
  expect(Toast.show).toHaveBeenCalledWith({ type: 'success', text1: 'Salvo' });
  expect(queryClient.getDefaultOptions().queries).toMatchObject({
    retry: false,
    staleTime: 20000,
  });
  queryClient
    .getDefaultOptions()
    .mutations?.onError?.(
      new Error('Falha'),
      undefined,
      undefined,
      {} as never,
    );
  expect(Toast.show).toHaveBeenLastCalledWith({
    type: 'error',
    text1: 'Falha',
  });
});
