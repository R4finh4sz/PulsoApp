import {
  fireEventAsync,
  renderAsync,
  screen,
  userEvent,
} from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import { Linking, Platform } from 'react-native';

import ProfilePhotoPicker from '@/components/ui/ProfilePhotoPicker';

jest.mock('expo-image-picker', () => ({
  getCameraPermissionsAsync: jest.fn(),
  getMediaLibraryPermissionsAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));
const photo = { uri: 'file:///photo.jpg', width: 100, height: 100 };
const granted = { granted: true, canAskAgain: true };
const onChange = jest.fn();
beforeEach(() => {
  jest.useFakeTimers();
  jest
    .mocked(ImagePicker.getCameraPermissionsAsync)
    .mockReset()
    .mockResolvedValue(granted as never);
  jest
    .mocked(ImagePicker.getMediaLibraryPermissionsAsync)
    .mockReset()
    .mockResolvedValue(granted as never);
  jest
    .mocked(ImagePicker.requestCameraPermissionsAsync)
    .mockReset()
    .mockResolvedValue(granted as never);
  jest
    .mocked(ImagePicker.requestMediaLibraryPermissionsAsync)
    .mockReset()
    .mockResolvedValue(granted as never);
  jest
    .mocked(ImagePicker.launchCameraAsync)
    .mockReset()
    .mockResolvedValue({ canceled: false, assets: [photo] } as never);
  jest
    .mocked(ImagePicker.launchImageLibraryAsync)
    .mockReset()
    .mockResolvedValue({ canceled: false, assets: [photo] } as never);
});
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});
const open = async () =>
  userEvent
    .setup()
    .press(
      screen.getByRole('button', { name: 'Escolher foto de perfil opcional' }),
    );

it.each([true, false])('seleciona foto pela câmera (%s)', async camera => {
  await renderAsync(<ProfilePhotoPicker value={null} onChange={onChange} />);
  await open();
  await fireEventAsync.press(
    screen.getByText(camera ? 'Tirar foto' : 'Escolher da galeria'),
  );
  expect(onChange).toHaveBeenCalledWith(photo);
  const launch = camera
    ? ImagePicker.launchCameraAsync
    : ImagePicker.launchImageLibraryAsync;
  expect(launch).toHaveBeenCalledWith(
    expect.objectContaining({
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    }),
  );
});

it('pede permissão quando pode perguntar novamente', async () => {
  jest
    .mocked(ImagePicker.getCameraPermissionsAsync)
    .mockResolvedValue({ granted: false, canAskAgain: true } as never);
  await renderAsync(<ProfilePhotoPicker value={null} onChange={onChange} />);
  await open();
  await fireEventAsync.press(screen.getByText('Tirar foto'));
  expect(ImagePicker.requestCameraPermissionsAsync).toHaveBeenCalled();
  expect(onChange).toHaveBeenCalledWith(photo);
});

it('orienta abrir configurações quando permissão está bloqueada', async () => {
  jest
    .mocked(ImagePicker.getMediaLibraryPermissionsAsync)
    .mockResolvedValue({ granted: false, canAskAgain: false } as never);
  const settings = jest
    .spyOn(Linking, 'openSettings')
    .mockRejectedValue(new Error('Unavailable'));
  await renderAsync(<ProfilePhotoPicker value={null} onChange={onChange} />);
  await open();
  await fireEventAsync.press(screen.getByText('Escolher da galeria'));
  expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
  await fireEventAsync.press(screen.getByText('Abrir configurações'));
  expect(settings).toHaveBeenCalled();
  expect(
    await screen.findByText(
      'Abra as configurações do aparelho para permitir o acesso.',
    ),
  ).toBeOnTheScreen();
});

it('não altera a foto quando seleção é cancelada e permite cancelar modal', async () => {
  jest
    .mocked(ImagePicker.launchImageLibraryAsync)
    .mockResolvedValue({ canceled: true, assets: null } as never);
  await renderAsync(<ProfilePhotoPicker value={null} onChange={onChange} />);
  await open();
  await fireEventAsync.press(screen.getByText('Escolher da galeria'));
  expect(onChange).not.toHaveBeenCalled();
  await open();
  await fireEventAsync.press(screen.getByText('Cancelar'));
  expect(screen.queryByText('Tirar foto')).not.toBeOnTheScreen();
});

it('exibe erro do picker e permite remover a foto', async () => {
  jest
    .mocked(ImagePicker.launchCameraAsync)
    .mockRejectedValue(new Error('Camera'));
  await renderAsync(
    <ProfilePhotoPicker value={photo as never} onChange={onChange} />,
  );
  await open();
  await fireEventAsync.press(screen.getByText('Tirar foto'));
  expect(
    await screen.findByText(
      'Não foi possível abrir a câmera ou galeria. Tente novamente ou continue sem foto.',
    ),
  ).toBeOnTheScreen();
  await fireEventAsync.press(screen.getByText('Remover foto'));
  expect(onChange).toHaveBeenCalledWith(null);
});

it('na web abre a galeria sem solicitar permissão nativa', async () => {
  jest.replaceProperty(Platform, 'OS', 'web');
  await renderAsync(<ProfilePhotoPicker value={null} onChange={onChange} />);
  await open();
  await fireEventAsync.press(screen.getByText('Escolher da galeria'));
  expect(ImagePicker.getMediaLibraryPermissionsAsync).not.toHaveBeenCalled();
  expect(onChange).toHaveBeenCalledWith(photo);
});
