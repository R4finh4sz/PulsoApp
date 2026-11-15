import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderAsync, screen, userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';

import FAQ from '@/app/(main)/FAQ';
import Security from '@/app/(main)/Security';
import { ProfileAccount } from '@/components/screens/Profile/ProfileAccount';
import useAuth from '@/contexts/Auth/useAuth';
import { faqService } from '@/services/faq';

jest.mock('@/services/faq', () => ({ faqService: { list: jest.fn() } }));
const mountFaq = () =>
  renderAsync(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: { queries: { retry: false, gcTime: 0 } },
        })
      }
    >
      <FAQ />
    </QueryClientProvider>,
  );

jest.mock('@/contexts/Auth/useAuth', () => ({
  __esModule: true,
  default: jest.fn(),
}));
const updateTwoFactor = jest.fn();
beforeEach(() => {
  jest
    .mocked(faqService.list)
    .mockReset()
    .mockResolvedValue([
      {
        id: 1,
        title: 'Como alterar minha senha?',
        message: 'Resposta do servidor',
        targetRole: 'STUDENT',
      },
      {
        id: 2,
        title: 'Esqueci minha senha. O que fazer?',
        message: 'Recupere o acesso',
        targetRole: 'STUDENT',
      },
    ]);
  updateTwoFactor.mockReset().mockResolvedValue(undefined);
  jest.mocked(useAuth).mockReturnValue({
    user: { id: 1 },
    twoFactorRequired: false,
    updateTwoFactor,
  } as never);
});

it('abre e fecha respostas e mantém somente uma expandida', async () => {
  const user = userEvent.setup();
  await mountFaq();
  await screen.findByText('Resposta do servidor');
  const first = screen.getByRole('button', {
    name: 'Como alterar minha senha?',
  });
  const second = screen.getByRole('button', {
    name: 'Esqueci minha senha. O que fazer?',
  });
  expect(first).toBeExpanded();
  await user.press(second);
  expect(first).toBeCollapsed();
  expect(second).toBeExpanded();
  await user.press(second);
  expect(second).toBeCollapsed();
});

it('adiciona os destinos de FAQ e segurança ao menu da conta', async () => {
  const user = userEvent.setup();
  await renderAsync(<ProfileAccount />);
  await user.press(screen.getByRole('button', { name: 'FAQ' }));
  expect(router.push).toHaveBeenLastCalledWith('/(main)/FAQ');
  await user.press(screen.getByRole('button', { name: 'Segurança' }));
  expect(router.push).toHaveBeenLastCalledWith('/(main)/Security');
});

it('abre a confirmação pelo switch e fecha ao concluir sem guardar a senha', async () => {
  const user = userEvent.setup();
  await renderAsync(<Security />);
  const toggle = screen.getByRole('switch', {
    name: 'Autenticação de 2 fatores',
  });
  await user.press(toggle);
  expect(
    screen.getByText('Digite sua senha para concluir a operação'),
  ).toBeOnTheScreen();
  await user.type(screen.getByLabelText('Senha'), 'minha-senha');
  await user.press(screen.getByRole('button', { name: 'Mostrar senha' }));
  expect(screen.getByLabelText('Senha')).toHaveProp('secureTextEntry', false);
  await user.press(screen.getByRole('button', { name: 'Concluir' }));
  expect(updateTwoFactor).toHaveBeenCalledWith(true, 'minha-senha');
  expect(
    screen.queryByText('Digite sua senha para concluir a operação'),
  ).not.toBeOnTheScreen();
  await user.press(toggle);
  expect(screen.getByLabelText('Senha')).toHaveDisplayValue('');
  expect(toggle).not.toBeChecked();
});

it('mantém o estado e mostra erro quando a atualização falha', async () => {
  updateTwoFactor.mockRejectedValue(new Error('Senha incorreta'));
  jest
    .mocked(useAuth)
    .mockReturnValue({ twoFactorRequired: true, updateTwoFactor } as never);
  const user = userEvent.setup();
  await renderAsync(<Security />);
  const toggle = screen.getByRole('switch');
  expect(toggle).toBeChecked();
  await user.press(toggle);
  await user.press(screen.getByRole('button', { name: 'Concluir' }));
  expect(updateTwoFactor).not.toHaveBeenCalled();
  await user.type(screen.getByLabelText('Senha'), 'incorreta');
  await user.press(screen.getByRole('button', { name: 'Concluir' }));
  expect(updateTwoFactor).toHaveBeenCalledWith(false, 'incorreta');
  expect(screen.getByText('Senha incorreta')).toBeOnTheScreen();
  expect(
    screen.getByText('Não foi possível alterar a autenticação'),
  ).toBeOnTheScreen();
  expect(screen.queryByLabelText('Senha')).not.toBeOnTheScreen();
  expect(toggle).toBeChecked();
  await user.press(screen.getByRole('button', { name: 'Entendi' }));
  expect(screen.queryByText('Senha incorreta')).not.toBeOnTheScreen();
  await user.press(toggle);
  expect(screen.getByLabelText('Senha')).toHaveDisplayValue('');
});

it('exibe FAQ vazio sem perguntas mockadas', async () => {
  jest.mocked(faqService.list).mockResolvedValue([]);
  await mountFaq();
  expect(
    await screen.findByText('Nenhuma pergunta disponível no momento.'),
  ).toBeOnTheScreen();
  expect(screen.queryByText('Como alterar minha senha?')).not.toBeOnTheScreen();
});

it('permite tentar novamente após falha ao consultar o FAQ', async () => {
  jest.mocked(faqService.list).mockRejectedValueOnce(new Error('Offline'));
  await mountFaq();
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Não foi possível carregar as perguntas frequentes.',
  );
  await userEvent
    .setup()
    .press(screen.getByRole('button', { name: 'Tentar novamente' }));
  expect(await screen.findByText('Resposta do servidor')).toBeOnTheScreen();
});

it('mostra carregamento enquanto aguarda o FAQ', async () => {
  jest.mocked(faqService.list).mockReturnValue(new Promise(() => {}));
  await mountFaq();
  expect(screen.getByLabelText('Carregando FAQ')).toBeOnTheScreen();
});
