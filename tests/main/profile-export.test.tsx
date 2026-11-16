import {
  renderAsync,
  screen,
  userEvent,
  waitFor,
} from '@testing-library/react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Share } from 'react-native';

import { ProfileAccount } from '@/components/screens/Profile/ProfileAccount';
import { profileService } from '@/services/profile';
import { useErrorModal } from '@/store/errorModalStore';

jest.mock('@/services/profile', () => ({
  profileService: { exportData: jest.fn() },
}));
jest.mock('expo-file-system', () => ({
  cacheDirectory: 'file:///cache/',
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('expo', () => ({
  requireOptionalNativeModule: jest.fn(() => ({})),
}));
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('react-native-toast-message', () => ({
  __esModule: true,
  default: { show: jest.fn() },
}));

afterEach(() => jest.restoreAllMocks());

it('compartilha o JSON retornado pela API', async () => {
  const data = { user: { id: 1 } };
  jest.mocked(profileService.exportData).mockResolvedValue(data);
  await renderAsync(<ProfileAccount />);
  await userEvent.press(
    screen.getByRole('button', { name: 'Exportação de dados' }),
  );
  await waitFor(() => expect(Sharing.shareAsync).toHaveBeenCalled());
  expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
    'file:///cache/pulso-dados.json',
    JSON.stringify(data, null, 2),
  );
  expect(Sharing.shareAsync).toHaveBeenCalledWith(
    'file:///cache/pulso-dados.json',
    expect.objectContaining({ mimeType: 'application/json' }),
  );
  expect(
    screen.getByRole('button', { name: 'Exportação de dados' }),
  ).toBeEnabled();
});

it('informa falha e libera nova tentativa', async () => {
  jest
    .mocked(profileService.exportData)
    .mockRejectedValue(new Error('Sem conexão'));
  const share = jest.spyOn(Share, 'share');
  await renderAsync(<ProfileAccount />);
  await userEvent.press(
    screen.getByRole('button', { name: 'Exportação de dados' }),
  );
  expect(share).not.toHaveBeenCalled();
  expect(useErrorModal.getState().modal).toEqual({
    message: 'Sem conexão',
  });
  expect(
    screen.getByRole('button', { name: 'Exportação de dados' }),
  ).toBeEnabled();
});
