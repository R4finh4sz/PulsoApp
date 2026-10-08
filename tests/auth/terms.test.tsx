import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  fireEventAsync,
  renderAsync,
  screen,
  userEvent,
} from '@testing-library/react-native';
import { Text } from 'react-native';

import TermsScreen from '@/app/(main)/TermsOfUse';
import { TermsGate } from '@/components/screens/TermsOfUse/TermsGate';
import { TermsOfUseContent } from '@/components/screens/TermsOfUse/TermsOfUseContent';
import useAuth from '@/contexts/Auth/useAuth';
import { termsService } from '@/services/terms';

jest.mock('@/contexts/Auth/useAuth', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('@/services/terms', () => ({
  termsService: { current: jest.fn(), accepted: jest.fn(), accept: jest.fn() },
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
  jest.mocked(useAuth).mockReturnValue({ user: { id: 1 } } as never);
  jest.mocked(termsService.current).mockReset().mockResolvedValue(terms);
  jest.mocked(termsService.accepted).mockReset().mockResolvedValue([]);
  jest.mocked(termsService.accept).mockReset().mockResolvedValue();
});
afterEach(() => jest.useRealTimers());

it('bloqueia o conteúdo até marcar e aceitar a versão atual', async () => {
  await mount(
    <TermsGate>
      <Text>Área protegida</Text>
    </TermsGate>,
  );
  expect(await screen.findByText('Documento oficial')).toBeOnTheScreen();
  expect(screen.queryByText('Área protegida')).not.toBeOnTheScreen();
  expect(screen.getByText('Prosseguir')).toBeDisabled();
  await userEvent.setup().press(screen.getByRole('checkbox'));
  jest.mocked(termsService.accepted).mockResolvedValue(['1.10']);
  await fireEventAsync.press(screen.getByText('Prosseguir'));
  expect(await screen.findByText('Área protegida')).toBeOnTheScreen();
  expect(termsService.accept).toHaveBeenCalledWith('1.10');
});

it('libera imediatamente a versão já aceita', async () => {
  jest.mocked(termsService.accepted).mockResolvedValue(['1.10']);
  await mount(
    <TermsGate>
      <Text>Área protegida</Text>
    </TermsGate>,
  );
  expect(await screen.findByText('Área protegida')).toBeOnTheScreen();
  expect(termsService.accept).not.toHaveBeenCalled();
});

it('mantém bloqueio quando aceite falha e apresenta mensagem', async () => {
  jest
    .mocked(termsService.accept)
    .mockRejectedValue(new Error('Falha ao salvar'));
  await mount(
    <TermsGate>
      <Text>Área protegida</Text>
    </TermsGate>,
  );
  await screen.findByText('Documento oficial');
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
  await mount(
    <TermsGate>
      <Text>Área protegida</Text>
    </TermsGate>,
  );
  await screen.findByText('Documento oficial');
  await userEvent.setup().press(screen.getByRole('checkbox'));
  jest
    .mocked(termsService.current)
    .mockResolvedValue({ ...terms, version: '2.0', content: 'Novo documento' });
  await fireEventAsync.press(screen.getByText('Prosseguir'));
  expect(await screen.findByText('Novo documento')).toBeOnTheScreen();
  expect(screen.getByRole('checkbox')).not.toBeChecked();
});

it.each(['gate', 'screen'])(
  'permite refazer consulta de termos após erro (%s)',
  async mode => {
    jest
      .mocked(termsService.current)
      .mockRejectedValueOnce(new Error('Offline'));
    await mount(
      mode === 'gate' ? (
        <TermsGate>
          <Text>Área protegida</Text>
        </TermsGate>
      ) : (
        <TermsScreen />
      ),
    );
    expect(await screen.findByText('Offline')).toBeOnTheScreen();
    await fireEventAsync.press(screen.getByText('Tentar novamente'));
    expect(await screen.findByText('Documento oficial')).toBeOnTheScreen();
  },
);

it('renderiza seções locais quando não há conteúdo remoto', async () => {
  await renderAsync(<TermsOfUseContent />);
  expect(screen.getAllByRole('header').length).toBeGreaterThan(1);
});
