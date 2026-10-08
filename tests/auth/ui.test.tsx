import { renderAsync, screen, userEvent } from '@testing-library/react-native';
import { useForm } from 'react-hook-form';
import { Text } from 'react-native';

import Checkbox from '@/components/ui/Checkbox';

// Icon assets are decorative; keep the real checkbox, pressable and form behavior.
jest.mock('@/components/ui/Icon', () => ({
  __esModule: true,
  default: () => null,
}));

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

it('solicita a inversão do valor ao tocar em Manter conectado', async () => {
  const onToggle = jest.fn();
  const user = userEvent.setup();
  const { rerenderAsync } = await renderAsync(
    <Checkbox checked={false} onToggle={onToggle}>
      <Text>Manter conectado</Text>
    </Checkbox>,
  );
  await user.press(screen.getByRole('checkbox', { name: 'Manter conectado' }));
  expect(onToggle).toHaveBeenLastCalledWith(true);
  await rerenderAsync(
    <Checkbox checked onToggle={onToggle}>
      <Text>Manter conectado</Text>
    </Checkbox>,
  );
  expect(screen.getByRole('checkbox')).toBeChecked();
  await user.press(screen.getByRole('checkbox'));
  expect(onToggle).toHaveBeenLastCalledWith(false);
});

const TermsForm = () => {
  const { control } = useForm({ defaultValues: { termsAccepted: false } });
  return (
    <Checkbox control={control} name="termsAccepted">
      <Text>Aceitar termos</Text>
    </Checkbox>
  );
};

it('alterna o aceite dos termos no React Hook Form', async () => {
  const user = userEvent.setup();
  await renderAsync(<TermsForm />);
  expect(
    screen.getByRole('checkbox', { name: 'Aceitar termos' }),
  ).not.toBeChecked();
  await user.press(screen.getByRole('checkbox'));
  expect(screen.getByRole('checkbox')).toBeChecked();
  await user.press(screen.getByRole('checkbox'));
  expect(screen.getByRole('checkbox')).not.toBeChecked();
});
