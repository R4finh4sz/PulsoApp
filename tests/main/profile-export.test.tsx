import { renderAsync, screen, userEvent } from '@testing-library/react-native';
import { Share } from 'react-native';
import Toast from 'react-native-toast-message';

import { ProfileAccount } from '@/components/screens/Profile/ProfileAccount';
import { profileService } from '@/services/profile';

jest.mock('@/services/profile', () => ({
  profileService: { exportData: jest.fn() },
}));
jest.mock('react-native-toast-message', () => ({
  __esModule: true,
  default: { show: jest.fn() },
}));

afterEach(() => jest.restoreAllMocks());

it('compartilha o JSON retornado pela API', async () => {
  const data = { user: { id: 1 } };
  jest.mocked(profileService.exportData).mockResolvedValue(data);
  const share = jest
    .spyOn(Share, 'share')
    .mockResolvedValue({ action: Share.sharedAction });
  await renderAsync(<ProfileAccount />);
  await userEvent.press(
    screen.getByRole('button', { name: 'Exportação de dados' }),
  );
  expect(share).toHaveBeenCalledWith({
    title: 'Dados pessoais do Pulso',
    message: JSON.stringify(data, null, 2),
  });
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
  expect(Toast.show).toHaveBeenCalledWith({
    type: 'error',
    text1: 'Sem conexão',
  });
  expect(
    screen.getByRole('button', { name: 'Exportação de dados' }),
  ).toBeEnabled();
});
