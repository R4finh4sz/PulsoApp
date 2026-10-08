import {
  act,
  fireEvent,
  renderAsync,
  screen,
  userEvent,
} from '@testing-library/react-native';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';

import { BackButton } from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { colors } from '@/global/colors';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

it('bloqueia botão durante a execução e libera depois do intervalo', async () => {
  const action = jest.fn();
  const user = userEvent.setup();
  await renderAsync(
    <Button accessibilityRole="button" text="Salvar" onPress={action} />,
  );
  await user.press(screen.getByRole('button', { name: 'Salvar' }));
  expect(action).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button')).toBeDisabled();
  await user.press(screen.getByRole('button'));
  expect(action).toHaveBeenCalledTimes(1);
  // userEvent automatically advances the press duration; advance the remaining delay.
  act(() => jest.advanceTimersByTime(1000));
  expect(screen.getByRole('button')).toBeEnabled();
});

it('respeita cores, ícones, estado desabilitado e modo sem atraso', async () => {
  const action = jest.fn();
  const user = userEvent.setup();
  const { rerenderAsync } = await renderAsync(
    <Button
      disabled
      accessibilityRole="button"
      text="Salvar"
      onPress={action}
    />,
  );
  expect(screen.getByRole('button')).toBeDisabled();
  expect(screen.getByRole('button')).toHaveStyle({
    backgroundColor: colors.neutral[20],
  });
  await user.press(screen.getByRole('button'));
  expect(action).not.toHaveBeenCalled();
  await rerenderAsync(
    <Button
      wired
      withoutDelay
      accessibilityRole="button"
      color="red"
      leftIcon={{ name: 'CheckIcon' }}
      rightIcon={{ name: 'Eye' }}
      text="Salvar"
      textColor="blue"
      onPress={action}
    />,
  );
  expect(screen.getByText('Salvar')).toHaveStyle({ color: 'blue' });
  await user.press(screen.getByRole('button'));
  expect(action).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button')).toBeEnabled();
  await rerenderAsync(
    <Button wired accessibilityRole="button" color="red" text="Salvar" />,
  );
  expect(screen.getByText('Salvar')).toHaveStyle({ color: 'red' });
  await user.press(screen.getByRole('button'));
});

it.each([true, false])(
  'botão voltar usa histórico quando disponível (%s)',
  async canGoBack => {
    jest.mocked(router.canGoBack).mockReturnValue(canGoBack);
    await renderAsync(<BackButton />);
    await userEvent
      .setup()
      .press(screen.getByRole('button', { name: 'Voltar' }));
    if (canGoBack) {
      expect(router.back).toHaveBeenCalled();
    } else {
      expect(router.replace).toHaveBeenCalledWith('/(auth)/Login');
    }
  },
);

it('permite fechar com ação customizada', async () => {
  const action = jest.fn();
  await renderAsync(<BackButton variant="close" onPress={action} />);
  await userEvent.setup().press(screen.getByRole('button', { name: 'Fechar' }));
  expect(action).toHaveBeenCalled();
});

const InputForm = ({
  suffix,
  unit,
  value = '',
}: {
  suffix?: string;
  unit?: string;
  value?: string;
}) => {
  const { control } = useForm({ defaultValues: { value } });
  return (
    <Input
      accessibilityLabel="Valor"
      control={control}
      label="Valor"
      name="value"
      suffix={suffix}
      unit={unit}
    />
  );
};

it('sincroniza entrada de texto com o formulário', async () => {
  await renderAsync(<InputForm />);
  const input = screen.getByLabelText('Valor');
  await userEvent.setup().type(input, 'Ana');
  expect(input).toHaveDisplayValue('Ana');
});

it('formata números com sufixo e permite limpar', async () => {
  await renderAsync(<InputForm suffix=" km" value="1234" />);
  expect(screen.getByLabelText('Valor')).toHaveDisplayValue('1.234 km');
  fireEvent.changeText(screen.getByLabelText('Valor'), '42abc');
  expect(screen.getByLabelText('Valor')).toHaveDisplayValue('42 km');
  fireEvent.changeText(screen.getByLabelText('Valor'), '');
  expect(screen.getByLabelText('Valor')).toHaveDisplayValue('');
});

it.each([
  ['1', '0,1 kg'],
  ['12', '1,2 kg'],
  ['1234', '123,4 kg'],
  ['abc', ''],
])('formata unidade para %s', async (value, expected) => {
  await renderAsync(<InputForm unit=" kg" value={value} />);
  expect(screen.getByLabelText('Valor')).toHaveDisplayValue(expected);
  fireEvent(screen.getByLabelText('Valor'), 'focus');
  expect(screen.getByLabelText('Valor')).toHaveDisplayValue(value);
  fireEvent.changeText(screen.getByLabelText('Valor'), '56x');
  fireEvent(screen.getByLabelText('Valor'), 'blur');
  expect(screen.getByLabelText('Valor')).toHaveDisplayValue('5,6 kg');
});

it('abre opções, seleciona e fecha o Select', async () => {
  const onChange = jest.fn();
  const user = userEvent.setup();
  await renderAsync(
    <Select
      label="Escola"
      options={[
        { value: '1', label: 'Escola A' },
        { value: '2', label: 'Escola B' },
      ]}
      value="1"
      onChange={onChange}
    />,
  );
  await user.press(screen.getByRole('button', { name: 'Escola' }));
  expect(screen.getByRole('radio', { name: 'Escola A' })).toBeSelected();
  await user.press(screen.getByRole('radio', { name: 'Escola B' }));
  expect(onChange).toHaveBeenCalledWith('2');
  expect(screen.queryByRole('radio')).not.toBeOnTheScreen();
  await user.press(screen.getByRole('button', { name: 'Escola' }));
  await user.press(screen.getByRole('button', { name: 'Fechar' }));
  expect(screen.queryByRole('radio')).not.toBeOnTheScreen();
});

it('exibe erro e impede abrir Select desabilitado', async () => {
  await renderAsync(
    <Select
      disabled
      error="Escolha uma escola"
      label="Escola"
      options={[]}
      value=""
      onChange={jest.fn()}
    />,
  );
  expect(screen.getByText('Selecione')).toBeOnTheScreen();
  expect(screen.getByText('Escolha uma escola')).toBeOnTheScreen();
  expect(screen.getByRole('button')).toBeDisabled();
});
