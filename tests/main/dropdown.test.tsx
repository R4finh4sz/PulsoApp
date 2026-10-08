import {
  act,
  fireEvent,
  renderAsync,
  renderHook,
  screen,
  userEvent,
} from '@testing-library/react-native';
import { useForm } from 'react-hook-form';

import Dropdown from '@/components/ui/DropDown';
import { DropdownItem } from '@/components/ui/DropDown/item';
import useDropdown, { DropdownProvider } from '@/contexts/common/Dropdown';

const options = [
  { value: '1', label: 'São Paulo' },
  { value: '2', label: 'Curitiba' },
];
const Form = ({
  disabled = false,
  editable = true,
}: {
  disabled?: boolean;
  editable?: boolean;
}) => {
  const { control } = useForm({ defaultValues: { school: '' } });
  return (
    <Dropdown
      searchable
      control={control}
      disabled={disabled}
      editable={editable}
      label="Escola"
      name="school"
      options={options}
    />
  );
};
const wrapper = DropdownProvider;
beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

it('pesquisa sem acentos, seleciona e limpa pesquisa ao reabrir', async () => {
  await renderAsync(<Form />, { wrapper });
  const user = userEvent.setup();
  await user.press(screen.getByRole('button', { name: 'Escola' }));
  expect(screen.getByRole('button')).toBeExpanded();
  fireEvent.changeText(screen.getByPlaceholderText('Pesquisar...'), 'sao');
  expect(screen.getByRole('radio', { name: 'São Paulo' })).toBeOnTheScreen();
  expect(
    screen.queryByRole('radio', { name: 'Curitiba' }),
  ).not.toBeOnTheScreen();
  await user.press(screen.getByRole('radio', { name: 'São Paulo' }));
  expect(screen.getByRole('button')).not.toBeExpanded();
  expect(screen.getByText('São Paulo')).toBeOnTheScreen();
  await user.press(screen.getByRole('button'));
  expect(screen.getByPlaceholderText('Pesquisar...')).toHaveDisplayValue('');
  expect(screen.getByRole('radio', { name: 'São Paulo' })).toBeSelected();
  fireEvent.changeText(screen.getByPlaceholderText('Pesquisar...'), 'missing');
  expect(screen.getByText('Nenhuma opção encontrada')).toBeOnTheScreen();
});

it('fecha dropdown aberto quando fica desabilitado', async () => {
  const { rerenderAsync } = await renderAsync(<Form />, { wrapper });
  await userEvent.setup().press(screen.getByRole('button'));
  await rerenderAsync(<Form disabled />);
  expect(screen.getByRole('button')).toBeDisabled();
  expect(screen.getByRole('button')).not.toBeExpanded();
  expect(screen.queryByRole('radio')).not.toBeOnTheScreen();
});

it('não permite abrir dropdown não editável', async () => {
  await renderAsync(<Form editable={false} />, { wrapper });
  await userEvent.setup().press(screen.getByRole('button'));
  expect(screen.queryByRole('radio')).not.toBeOnTheScreen();
});

it('apresenta endereço completo da opção', async () => {
  await renderAsync(
    <DropdownItem
      option={{
        value: '1',
        label: 'Escola',
        address: {
          street: 'Rua A',
          number: '10',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01001000',
        },
      }}
    />,
  );
  expect(
    screen.getByText('Rua A, 10 - Centro, São Paulo - SP'),
  ).toBeOnTheScreen();
});

it('provider mantém apenas a chave selecionada', () => {
  const { result } = renderHook(useDropdown, { wrapper });
  act(() => result.current.setDropDownKey('first'));
  expect(result.current.dropDownKey).toBe('first');
  act(() => result.current.setDropDownKey('second'));
  expect(result.current.dropDownKey).toBe('second');
});

it('explica ausência de provider', () => {
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  expect(() => renderHook(useDropdown)).toThrow('DropdownProvider');
  spy.mockRestore();
});
