import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  fireEventAsync,
  renderAsync,
  screen,
  userEvent,
} from '@testing-library/react-native';
import { router, usePathname } from 'expo-router';
import { Text } from 'react-native';

import TermsScreen from '@/app/(main)/TermsOfUse';
import { TermsAcceptance } from '@/components/screens/TermsOfUse/TermsAcceptance';
import { TermsGate } from '@/components/screens/TermsOfUse/TermsGate';
import { TermsOfUseContent } from '@/components/screens/TermsOfUse/TermsOfUseContent';
import useAuth from '@/contexts/Auth/useAuth';
import { termsService } from '@/services/terms';

jest.mock('@/contexts/Auth/useAuth', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('@/services/terms', () => ({
  usesStudentTerm: jest.requireActual('@/services/terms').usesStudentTerm,
  termsService: {
    current: jest.fn(),
    privacy: jest.fn(),
    accepted: jest.fn(),
    accept: jest.fn(),
  },
}));
const terms = {
  title: 'Termos publicados',
  content: 'Documento oficial',
  version: '1.10',
};
const mount = (ui: React.ReactElement) =>
  renderAsync(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider
        client={
          new QueryClient({
            defaultOptions: { queries: { retry: false, gcTime: 0 } },
          })
        }
      >
        {children}
      </QueryClientProvider>
    ),
  });

beforeEach(() => {
  jest.useFakeTimers();
  jest.mocked(usePathname).mockReturnValue('/Home');
  jest.mocked(router.push).mockClear();
  jest.mocked(router.replace).mockClear();
  jest.mocked(useAuth).mockReturnValue({
    user: { id: 1, termsAccepted: false },
    confirmTermsAcceptance: jest.fn().mockResolvedValue(undefined),
  } as never);
  jest.mocked(termsService.current).mockReset().mockResolvedValue(terms);
  jest.mocked(termsService.privacy).mockReset().mockResolvedValue({
    title: 'Política de Privacidade',
    content: 'Documento de privacidade',
    version: '1.3',
  });
  jest.mocked(termsService.accept).mockReset().mockResolvedValue();
});
afterEach(() => jest.useRealTimers());

it('mostra aviso na Home e abre a tela sem aceitar automaticamente', async () => {
  const view = await mount(
    <TermsGate>
      <Text>Home do aluno</Text>
    </TermsGate>,
  );
  expect(screen.getByText('Termos atualizados')).toBeOnTheScreen();
  expect(termsService.current).not.toHaveBeenCalled();
  expect(screen.queryByRole('checkbox')).not.toBeOnTheScreen();
  await fireEventAsync.press(screen.getByText('Ler os termos'));
  expect(router.push).toHaveBeenCalledWith('/(main)/TermsOfUse');
  expect(termsService.accept).not.toHaveBeenCalled();
  jest.mocked(usePathname).mockReturnValue('/TermsOfUse');
  await view.rerenderAsync(
    <TermsGate>
      <TermsScreen />
    </TermsGate>,
  );
  expect(await screen.findByText('Documento oficial')).toBeOnTheScreen();
  expect(screen.queryByText('Termos atualizados')).not.toBeOnTheScreen();
  await fireEventAsync.press(screen.getByRole('button', { name: 'Voltar' }));
  expect(router.replace).toHaveBeenCalledWith('/(main)/Home');
  expect(termsService.accept).not.toHaveBeenCalled();
  jest.mocked(usePathname).mockReturnValue('/Home');
  await view.rerenderAsync(
    <TermsGate>
      <Text>Home do aluno</Text>
    </TermsGate>,
  );
  expect(screen.getByText('Termos atualizados')).toBeOnTheScreen();
});

it('redireciona outras áreas para Home enquanto há pendência', async () => {
  jest.mocked(usePathname).mockReturnValue('/Quiz');
  await mount(
    <TermsGate>
      <Text>Quiz protegido</Text>
    </TermsGate>,
  );
  expect(screen.getByText('/(main)/Home')).toBeOnTheScreen();
  expect(screen.queryByText('Quiz protegido')).not.toBeOnTheScreen();
});

it('seleciona termos gerais no aceite e na consulta para aluno adulto', async () => {
  jest.mocked(useAuth).mockReturnValue({
    user: { id: 1, birthDate: '2000-10-08', termsAccepted: false },
    confirmTermsAcceptance: jest.fn(),
  } as never);
  const view = await mount(<TermsAcceptance />);
  expect(
    await screen.findByText('Li e concordo com o termo'),
  ).toBeOnTheScreen();
  expect(screen.getByRole('tab', { name: /Privacidade/ })).toBeOnTheScreen();
  expect(termsService.current).toHaveBeenCalledWith(false);
  expect(screen.getByText('Prosseguir')).toBeDisabled();
  await view.rerenderAsync(<TermsScreen />);
  expect(await screen.findByText('Documento oficial')).toBeOnTheScreen();
  expect(termsService.current).toHaveBeenLastCalledWith(false);
});

it('bloqueia o conteúdo até marcar e aceitar a versão atual', async () => {
  const view = await mount(<TermsAcceptance />);
  expect(await screen.findByText('Documento oficial')).toBeOnTheScreen();
  expect(screen.queryByText('Área protegida')).not.toBeOnTheScreen();
  expect(screen.getByText('Prosseguir')).toBeDisabled();
  await userEvent.setup().press(screen.getAllByRole('checkbox')[0]);
  expect(screen.getByText('Prosseguir')).toBeDisabled();
  await userEvent
    .setup()
    .press(screen.getByRole('tab', { name: /Privacidade/ }));
  await userEvent.setup().press(screen.getByRole('checkbox'));
  jest.mocked(useAuth).mockReturnValue({
    user: { id: 1, termsAccepted: true },
    confirmTermsAcceptance: jest.fn(),
  } as never);
  await fireEventAsync.press(screen.getByText('Prosseguir'));
  expect(router.replace).toHaveBeenCalledWith('/(main)/Home');
  await view.rerenderAsync(
    <TermsGate>
      <Text>Área protegida</Text>
    </TermsGate>,
  );
  expect(await screen.findByText('Área protegida')).toBeOnTheScreen();
  expect(termsService.accept).toHaveBeenCalledWith('1.10', '1.3');
});

it('libera imediatamente a versão já aceita', async () => {
  jest.mocked(useAuth).mockReturnValue({
    user: { id: 1, termsAccepted: true },
    confirmTermsAcceptance: jest.fn(),
  } as never);
  await mount(
    <TermsGate>
      <Text>Área protegida</Text>
    </TermsGate>,
  );
  expect(await screen.findByText('Área protegida')).toBeOnTheScreen();
  expect(termsService.accept).not.toHaveBeenCalled();
});

it.each(['terms', 'privacy'])(
  'não exibe termos enquanto verifica o aceite (%s primeiro)',
  async first => {
    let resolveTerms!: (value: typeof terms) => void;
    let resolveAccepted!: (value: typeof terms) => void;
    jest.mocked(termsService.current).mockReturnValue(
      new Promise(resolve => {
        resolveTerms = resolve;
      }),
    );
    jest.mocked(termsService.privacy).mockReturnValue(
      new Promise(resolve => {
        resolveAccepted = resolve;
      }),
    );
    await mount(<TermsAcceptance />);
    expect(screen.getByLabelText('Verificando acesso')).toBeOnTheScreen();
    expect(
      screen.queryByText(
        'Leia o Termo do Estudante e a Política de Privacidade para continuar no Pulso.',
      ),
    ).not.toBeOnTheScreen();
    await act(async () => {
      if (first === 'terms') {
        resolveTerms(terms);
      } else {
        resolveAccepted({ ...terms, content: 'Documento de privacidade' });
      }
    });
    expect(screen.getByLabelText('Verificando acesso')).toBeOnTheScreen();
    expect(
      screen.queryByText(
        'Leia o Termo do Estudante e a Política de Privacidade para continuar no Pulso.',
      ),
    ).not.toBeOnTheScreen();
    await act(async () => {
      if (first === 'terms') {
        resolveAccepted({ ...terms, content: 'Documento de privacidade' });
      } else {
        resolveTerms(terms);
      }
    });
    expect(await screen.findByText('Documento oficial')).toBeOnTheScreen();
    expect(
      screen.queryByText(
        'Leia o Termo do Estudante e a Política de Privacidade para continuar no Pulso.',
      ),
    ).toBeOnTheScreen();
  },
);

it('mantém bloqueio quando aceite falha e apresenta mensagem', async () => {
  jest
    .mocked(termsService.accept)
    .mockRejectedValue(new Error('Falha ao salvar'));
  await mount(<TermsAcceptance />);
  await screen.findByText('Documento oficial');
  await userEvent.setup().press(screen.getAllByRole('checkbox')[0]);
  await userEvent
    .setup()
    .press(screen.getByRole('tab', { name: /Privacidade/ }));
  await userEvent.setup().press(screen.getByRole('checkbox'));
  await fireEventAsync.press(screen.getByText('Prosseguir'));
  expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao salvar');
  expect(screen.queryByText('Área protegida')).not.toBeOnTheScreen();
});

it('atualiza documento e exige novo aceite quando o backend retorna conflito', async () => {
  jest.mocked(termsService.accept).mockRejectedValue({
    isAxiosError: true,
    response: { status: 409, data: { message: 'Versão alterada' } },
  });
  await mount(<TermsAcceptance />);
  await screen.findByText('Documento oficial');
  await userEvent.setup().press(screen.getAllByRole('checkbox')[0]);
  await userEvent
    .setup()
    .press(screen.getByRole('tab', { name: /Privacidade/ }));
  await userEvent.setup().press(screen.getByRole('checkbox'));
  jest
    .mocked(termsService.current)
    .mockResolvedValue({ ...terms, version: '2.0', content: 'Novo documento' });
  await fireEventAsync.press(screen.getByText('Prosseguir'));
  expect(await screen.findByText('Novo documento')).toBeOnTheScreen();
  expect(screen.getAllByRole('checkbox')[0]).not.toBeChecked();
});

it.each(['gate', 'screen'])(
  'permite refazer consulta de termos após erro (%s)',
  async mode => {
    jest
      .mocked(termsService.current)
      .mockRejectedValueOnce(new Error('Offline'));
    await mount(mode === 'gate' ? <TermsAcceptance /> : <TermsScreen />);
    expect(await screen.findByText('Offline')).toBeOnTheScreen();
    await fireEventAsync.press(screen.getByText('Tentar novamente'));
    expect(await screen.findByText('Documento oficial')).toBeOnTheScreen();
  },
);

it('renderiza seções locais quando não há conteúdo remoto', async () => {
  await renderAsync(<TermsOfUseContent />);
  expect(screen.getAllByRole('header').length).toBeGreaterThan(1);
});
