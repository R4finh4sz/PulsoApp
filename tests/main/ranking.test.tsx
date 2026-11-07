import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  renderAsync,
  screen,
  userEvent,
  waitFor,
} from '@testing-library/react-native';

import Ranking from '@/app/(main)/Ranking';
import { DropdownProvider } from '@/contexts/common/Dropdown';
import { rankingService } from '@/services/rankings';

jest.mock('@/contexts/Auth/useAuth', () => ({
  __esModule: true,
  default: () => ({ user: { id: 12, schoolId: 1 } }),
}));
jest.mock('@/hooks/useStudentProfile', () => ({
  useStudentProfile: () => ({ data: { user: { schoolId: 1 } } }),
}));
jest.mock('@/services/mock', () => ({ isMockEnabled: false }));
jest.mock('@/services/rankings', () => ({
  rankingService: { list: jest.fn() },
}));

const mount = () =>
  renderAsync(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: { queries: { retry: false, gcTime: 0 } },
        })
      }
    >
      <DropdownProvider>
        <Ranking />
      </DropdownProvider>
    </QueryClientProvider>,
  );

it('preserva posições e empates da API e consulta escola e bimestre selecionados', async () => {
  jest.mocked(rankingService.list).mockResolvedValue([
    {
      position: 1,
      studentId: 12,
      studentName: 'Ana Silva',
      totalActivities: 2,
      accuracyPercentage: 90,
    },
    {
      position: 1,
      studentId: 25,
      studentName: 'Bruno Souza',
      totalActivities: 2,
      accuracyPercentage: 90,
    },
  ] as never);
  const year = new Date().getFullYear();
  await mount();
  expect(
    await screen.findByLabelText(
      '1º lugar, Bruno Souza, 90% de acertos, 2 atividades',
    ),
  ).toBeOnTheScreen();
  expect(screen.queryByText('Demonstração')).not.toBeOnTheScreen();
  expect(rankingService.list).toHaveBeenCalledWith(
    { year, bimester: 4 },
    expect.anything(),
  );
  const user = userEvent.setup();
  await user.press(screen.getByRole('button', { name: 'Ranking' }));
  await user.press(screen.getByRole('radio', { name: 'Minha escola' }));
  await waitFor(() =>
    expect(rankingService.list).toHaveBeenCalledWith(
      { year, bimester: 4, schoolId: 1 },
      expect.anything(),
    ),
  );
  await user.press(screen.getByRole('button', { name: `Bimestre de ${year}` }));
  await user.press(screen.getByRole('radio', { name: '2º bimestre' }));
  await waitFor(() =>
    expect(rankingService.list).toHaveBeenCalledWith(
      { year, bimester: 2, schoolId: 1 },
      expect.anything(),
    ),
  );
});

it('mostra ranking vazio', async () => {
  jest.mocked(rankingService.list).mockResolvedValue([]);
  await mount();
  expect(
    await screen.findByText('Nenhum resultado neste bimestre.'),
  ).toBeOnTheScreen();
});

it('consulta automaticamente o ano de 2027 quando o dispositivo está em 2027', async () => {
  jest.useFakeTimers({
    doNotFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'],
  });
  jest.setSystemTime(new Date(2027, 0, 10));
  try {
    jest.mocked(rankingService.list).mockResolvedValue([]);
    await mount();
    await waitFor(() =>
      expect(rankingService.list).toHaveBeenCalledWith(
        { year: 2027, bimester: 4 },
        expect.anything(),
      ),
    );
  } finally {
    jest.useRealTimers();
  }
});

it('permite tentar novamente após falha', async () => {
  jest
    .mocked(rankingService.list)
    .mockRejectedValueOnce(new Error('Offline'))
    .mockResolvedValue([]);
  await mount();
  await userEvent.press(
    await screen.findByRole('button', { name: 'Tentar novamente' }),
  );
  expect(
    await screen.findByText('Nenhum resultado neste bimestre.'),
  ).toBeOnTheScreen();
});
