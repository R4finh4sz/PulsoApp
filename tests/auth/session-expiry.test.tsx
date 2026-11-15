import { act, renderAsync, screen, userEvent } from '@testing-library/react-native';
import { AppState } from 'react-native';
import SessionExpiry from '@/components/ui/SessionExpiry';

jest.mock('@/components/ui/ModalBackdrop', () => {
  const React = require('react');
  const { Text, Pressable } = require('react-native');
  return ({ title, onClose }: { title: string; onClose: () => void }) =>
    React.createElement(Pressable, { onPress: onClose, accessibilityRole: 'button', accessibilityLabel: 'Entendi' }, React.createElement(Text, null, title));
});
beforeEach(() => jest.useFakeTimers());
afterEach(() => { jest.useRealTimers(); jest.restoreAllMocks(); });

it('avisa no último minuto e encerra no prazo mesmo após fechar o aviso', async () => {
  const onExpire = jest.fn();
  await renderAsync(<SessionExpiry expiresAt={new Date(Date.now() + 2 * 60_000).toISOString()} onExpire={onExpire} />);
  expect(screen.queryByText('Sua sessão está terminando')).not.toBeOnTheScreen();
  await act(async () => { jest.advanceTimersByTime(60_000); });
  expect(screen.getByText('Sua sessão está terminando')).toBeOnTheScreen();
  await userEvent.setup().press(screen.getByRole('button', { name: 'Entendi' }));
  expect(screen.queryByText('Sua sessão está terminando')).not.toBeOnTheScreen();
  await act(async () => { jest.advanceTimersByTime(60_000); });
  expect(onExpire).toHaveBeenCalledTimes(1);
});

it('confere vencimento ao retornar do segundo plano', async () => {
  let resume: (state: string) => void = () => {};
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_, handler) => {
    resume = handler;
    return { remove: jest.fn() };
  });
  const onExpire = jest.fn();
  const start = Date.now();
  await renderAsync(<SessionExpiry expiresAt={new Date(start + 2 * 60_000).toISOString()} onExpire={onExpire} />);
  jest.setSystemTime(start + 3 * 60_000);
  await act(async () => resume('active'));
  expect(onExpire).toHaveBeenCalledTimes(1);
});
