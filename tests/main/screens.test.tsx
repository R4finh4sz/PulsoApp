import {
  act,
  fireEvent,
  renderAsync,
  screen,
  userEvent,
} from '@testing-library/react-native';
import { router } from 'expo-router';
import { View } from 'react-native';

import Home from '@/app/(main)/Home';
import Profile from '@/app/(main)/Profile';
import Reports from '@/app/(main)/Reports';
import Teams from '@/app/(main)/Teams';
import { HomeActivities } from '@/components/screens/Home/HomeActivities';
import { HomeHeader } from '@/components/screens/Home/HomeHeader';
import { HomeSchoolCourses } from '@/components/screens/Home/HomeSchoolCourses';
import { homeMock } from '@/components/screens/Home/mock';
import { ProfileHeader } from '@/components/screens/Profile/ProfileHeader';
import { ProfileLogout } from '@/components/screens/Profile/ProfileLogout';
import { ProfileStudentData } from '@/components/screens/Profile/ProfileStudentData';
import { TeamsHeader } from '@/components/screens/Teams/TeamsHeader';
import useAuth from '@/contexts/Auth/useAuth';
import { useStudentClassrooms } from '@/hooks/useStudentClassrooms';

jest.mock('@/contexts/Auth/useAuth', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('@/hooks/useStudentClassrooms', () => ({
  useStudentClassrooms: jest.fn(),
}));
const refetch = jest.fn();
const logout = jest.fn();
const student = {
  id: 1,
  fullName: 'Ana Maria Silva',
  email: 'ana@pulso.app',
  ra: '1234',
  classroomId: 1,
};
const data = [
  {
    id: 1,
    name: 'Turma A',
    schoolCourses: [
      { id: 10, name: 'Matemática', classroomId: 1, teacherId: 2 },
    ],
  },
];
const query = {
  data,
  isPending: false,
  isError: false,
  isFetching: false,
  isRefetching: false,
  refetch,
};

beforeEach(() => {
  jest.useFakeTimers();
  jest.mocked(useAuth).mockReturnValue({ user: student, logout } as never);
  jest.mocked(useStudentClassrooms).mockReturnValue(query as never);
  logout.mockReset().mockResolvedValue(undefined);
});
afterEach(() => jest.useRealTimers());

it('Home mostra o aluno, desempenho e matérias e navega para cada destino', async () => {
  await renderAsync(<Home />);
  expect(screen.getByText('Ana Maria Silva')).toBeOnTheScreen();
  expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({
    now: homeMock.performance,
  });
  const user = userEvent.setup();
  await user.press(screen.getByRole('button', { name: 'Abrir perfil' }));
  expect(router.push).toHaveBeenCalledWith('/(main)/Profile');
  await user.press(screen.getByRole('button', { name: 'Ver tudo' }));
  expect(router.push).toHaveBeenCalledWith('/(main)/Teams');
  await user.press(
    screen.getByRole('button', { name: 'Ver atividades de Matemática' }),
  );
  expect(router.push).toHaveBeenCalledWith({
    pathname: '/(main)/SchoolCourseActivities',
    params: {
      schoolCourseId: 10,
      schoolCourseName: 'Matemática',
      classroomId: 1,
    },
  });
});

it.each([
  [{ ...query, isPending: true, data: undefined }, 'Carregando matérias'],
  [{ ...query, data: [] }, 'Você ainda não está vinculado a uma sala.'],
  [
    { ...query, data: [{ id: 1, schoolCourses: [] }] },
    'Nenhuma matéria cadastrada nesta sala.',
  ],
  [{ ...query, isError: true }, 'Não foi possível carregar suas matérias.'],
])('Home trata estado de consulta (%#)', async (state, text) => {
  jest.mocked(useStudentClassrooms).mockReturnValue(state as never);
  await renderAsync(<HomeSchoolCourses onViewAll={jest.fn()} />);
  if (state.isPending) {
    expect(screen.getByLabelText(text)).toBeOnTheScreen();
  } else {
    expect(screen.getByText(text)).toBeOnTheScreen();
  }
  if (state.isError) {
    fireEvent.press(screen.getByText('Tentar novamente'));
    expect(refetch).toHaveBeenCalled();
  }
});

it('Teams mostra turma e matérias e abre a atividade selecionada', async () => {
  await renderAsync(<Teams />);
  expect(screen.getByText('Turma A')).toBeOnTheScreen();
  await userEvent
    .setup()
    .press(
      screen.getByRole('button', { name: 'Ver atividades de Matemática' }),
    );
  expect(router.push).toHaveBeenCalledWith(
    expect.objectContaining({ pathname: '/(main)/SchoolCourseActivities' }),
  );
  await userEvent
    .setup()
    .press(screen.getByRole('button', { name: 'Abrir perfil' }));
  expect(router.push).toHaveBeenCalledWith('/(main)/Profile');
});

it.each([
  [{ ...query, isPending: true }, 'Carregando matérias'],
  [
    { ...query, isError: true },
    'Não foi possível carregar sua sala e suas matérias.',
  ],
  [{ ...query, data: [] }, 'Nenhuma matéria encontrada'],
])('Teams trata estado de consulta (%#)', async (state, text) => {
  jest.mocked(useStudentClassrooms).mockReturnValue(state as never);
  await renderAsync(<Teams />);
  if (state.isPending) {
    expect(screen.getByLabelText(text)).toBeOnTheScreen();
  } else {
    expect(screen.getByText(text)).toBeOnTheScreen();
  }
  if (state.isError) {
    fireEvent.press(screen.getByText('Tentar novamente'));
    expect(refetch).toHaveBeenCalled();
  }
});

it('Reports apresenta gráficos acessíveis e acesso ao perfil', async () => {
  await renderAsync(<Reports />);
  expect(
    screen.getByRole('header', { name: 'Meu desempenho' }),
  ).toBeOnTheScreen();
  expect(screen.getAllByRole('progressbar').length).toBeGreaterThan(0);
  await userEvent
    .setup()
    .press(screen.getByRole('button', { name: 'Abrir perfil' }));
  expect(router.push).toHaveBeenCalledWith('/(main)/Profile');
});

it('Profile mostra iniciais, dados e abre opções da conta', async () => {
  await renderAsync(<Profile />);
  expect(screen.getByText('AS')).toBeOnTheScreen();
  expect(screen.getByText('1234')).toBeOnTheScreen();
  expect(screen.getByText('Turma A')).toBeOnTheScreen();
  const user = userEvent.setup();
  await user.press(screen.getByRole('button', { name: 'Alterar senha' }));
  expect(router.push).toHaveBeenCalledWith('/(main)/ResetPassword');
  await user.press(screen.getByRole('button', { name: 'Termos de uso' }));
  expect(router.push).toHaveBeenCalledWith('/(main)/TermsOfUse');
  await user.press(screen.getByRole('button', { name: 'Voltar' }));
  expect(router.replace).toHaveBeenCalledWith('/(main)/Home');
});

it('Profile usa iniciais de fallback e turma indisponível', async () => {
  jest.mocked(useAuth).mockReturnValue({ user: null } as never);
  await renderAsync(<ProfileHeader />);
  expect(screen.getByText('AL')).toBeOnTheScreen();
});

it.each([
  [{ ...query, isPending: true }, 'Carregando…'],
  [{ ...query, isError: true }, 'Não foi possível carregar'],
])('perfil mostra estado da turma (%#)', async (state, text) => {
  jest.mocked(useStudentClassrooms).mockReturnValue(state as never);
  await renderAsync(<ProfileStudentData />);
  expect(screen.getByText(text)).toBeOnTheScreen();
});

it('logout permite cancelar e confirmar a saída', async () => {
  await renderAsync(<ProfileLogout />);
  const user = userEvent.setup();
  await user.press(screen.getByRole('button', { name: 'Sair da conta' }));
  fireEvent.press(screen.getByText('Não'));
  expect(logout).not.toHaveBeenCalled();
  await user.press(screen.getByRole('button', { name: 'Sair da conta' }));
  fireEvent.press(screen.getByText('Continuar'));
  await act(async () => {});
  expect(logout).toHaveBeenCalledTimes(1);
});

it('logout informa falha na limpeza e permite fechar aviso', async () => {
  logout.mockRejectedValue(new Error('Storage'));
  await renderAsync(<ProfileLogout />);
  await userEvent
    .setup()
    .press(screen.getByRole('button', { name: 'Sair da conta' }));
  fireEvent.press(screen.getByText('Continuar'));
  expect(
    await screen.findByText(
      'Não foi possível remover a sessão salva. Tente sair novamente.',
    ),
  ).toBeOnTheScreen();
  await userEvent
    .setup()
    .press(screen.getByRole('button', { name: 'Entendi' }));
  expect(
    screen.queryByText(
      'Não foi possível remover a sessão salva. Tente sair novamente.',
    ),
  ).not.toBeOnTheScreen();
});

it('cabeçalhos respeitam ação customizada', async () => {
  const onProfile = jest.fn();
  const { rerenderAsync } = await renderAsync(
    <View>
      <HomeHeader name="Ana" onProfile={onProfile} />
    </View>,
  );
  await userEvent
    .setup()
    .press(screen.getByRole('button', { name: 'Abrir perfil' }));
  await rerenderAsync(
    <View>
      <TeamsHeader onProfile={onProfile} />
    </View>,
  );
  await userEvent
    .setup()
    .press(screen.getByRole('button', { name: 'Abrir perfil' }));
  expect(onProfile).toHaveBeenCalledTimes(2);
});

it('limita atividades da Home a três e abre a lista completa', async () => {
  const onViewAll = jest.fn();
  const activities = [
    ...homeMock.activities,
    { ...homeMock.activities[0], id: 'extra', title: 'Oculta' },
  ];
  await renderAsync(
    <HomeActivities activities={activities as never} onViewAll={onViewAll} />,
  );
  expect(screen.queryByText('Oculta')).not.toBeOnTheScreen();
  expect(screen.getByText(activities[0].title)).toBeOnTheScreen();
  await userEvent
    .setup()
    .press(screen.getByRole('button', { name: 'Ver tudo' }));
  expect(onViewAll).toHaveBeenCalledTimes(1);
});
