import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  fireEventAsync,
  renderAsync,
  screen,
  userEvent,
  waitFor,
} from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';

import { ProfileHeader } from '@/components/screens/Profile/ProfileHeader';
import ErrorModal from '@/components/ui/Modals/ErrorModal';
import useAuth from '@/contexts/Auth/useAuth';
import { profileService } from '@/services/profile';
import { useErrorModal } from '@/store/errorModalStore';

jest.mock('@/contexts/Auth/useAuth', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('@/services/profile', () => ({
  profileService: { get: jest.fn(), photo: jest.fn(), updatePhoto: jest.fn() },
}));
jest.mock('expo-image-picker', () => ({
  getMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

const photo = { uri: 'file:///new.jpg', width: 100, height: 100 };
const oldPhoto = 'data:image/jpeg;base64,b2xk';
beforeEach(() => {
  jest.useFakeTimers();
  useErrorModal.getState().closeErrorModal();
  jest
    .mocked(useAuth)
    .mockReturnValue({ user: { id: 1, fullName: 'Ana Silva' } } as never);
  jest.mocked(profileService.photo).mockReset().mockResolvedValue(oldPhoto);
  jest
    .mocked(profileService.get)
    .mockResolvedValue({ user: { id: 1, fullName: 'Ana Silva' } } as never);
  jest
    .mocked(profileService.updatePhoto)
    .mockReset()
    .mockResolvedValue(undefined);
  jest
    .mocked(ImagePicker.getMediaLibraryPermissionsAsync)
    .mockResolvedValue({ granted: true } as never);
  jest
    .mocked(ImagePicker.launchImageLibraryAsync)
    .mockResolvedValue({ canceled: false, assets: [photo] } as never);
});
afterEach(() => jest.useRealTimers());

const mount = async () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  client.setQueryData(['student-photo', 1], oldPhoto);
  await renderAsync(
    <QueryClientProvider client={client}>
      <ProfileHeader />

      <ErrorModal />
    </QueryClientProvider>,
  );
  return client;
};
const choose = async () => {
  await userEvent
    .setup()
    .press(screen.getByRole('button', { name: 'Alterar foto de perfil' }));
  await fireEventAsync.press(screen.getByText('Escolher da galeria'));
};

it('envia a seleção e atualiza a foto compartilhada após sucesso', async () => {
  const client = await mount();
  const updated = 'data:image/jpeg;base64,bmV3';
  jest.mocked(profileService.photo).mockResolvedValue(updated);
  await choose();
  expect(profileService.updatePhoto).toHaveBeenCalledWith(
    photo,
    expect.anything(),
  );
  await waitFor(() =>
    expect(client.getQueryData(['student-photo', 1])).toBe(updated),
  );
});

it('mantém a foto anterior e exibe o erro do backend em modal', async () => {
  const client = await mount();
  jest.mocked(profileService.updatePhoto).mockRejectedValueOnce({
    isAxiosError: true,
    response: { data: { detail: 'Imagem inválida.' } },
  });
  await choose();
  expect(await screen.findByText('Imagem inválida.')).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Entendi' })).toBeEnabled();
  expect(client.getQueryData(['student-photo', 1])).toBe(oldPhoto);
});

it('cancelar a seleção não envia nem altera a foto', async () => {
  const client = await mount();
  jest
    .mocked(ImagePicker.launchImageLibraryAsync)
    .mockResolvedValueOnce({ canceled: true, assets: null });
  await choose();
  expect(profileService.updatePhoto).not.toHaveBeenCalled();
  expect(client.getQueryData(['student-photo', 1])).toBe(oldPhoto);
});

it('bloqueia novas seleções enquanto salva a foto', async () => {
  jest
    .mocked(profileService.updatePhoto)
    .mockReturnValueOnce(new Promise(() => {}));
  await mount();
  await choose();
  await waitFor(() =>
    expect(
      screen.getByRole('button', { name: 'Alterar foto de perfil' }),
    ).toBeDisabled(),
  );
  expect(screen.getByLabelText('Salvando foto de perfil')).toBeOnTheScreen();
});
