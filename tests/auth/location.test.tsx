import { act, renderHook } from '@testing-library/react-native';
import { useForm } from 'react-hook-form';

import { useRegistrationLocation } from '@/hooks/useRegistrationLocation';
import { getAdressByZipCode } from '@/services/cep';
import { registrationService } from '@/services/registration';
import { RegisterForm } from '@/validation/Register.validation';

jest.mock('@/services/cep', () => ({ getAdressByZipCode: jest.fn() }));
jest.mock('@/services/registration', () => ({
  registrationService: { schools: jest.fn() },
}));

const mount = (cep = '') =>
  renderHook(() => {
    const form = useForm<RegisterForm>({
      defaultValues: { cep, city: 'Antiga', state: 'RJ', schoolId: 'old' },
    });
    return { form, location: useRegistrationLocation(form) };
  });
beforeEach(() => {
  jest.useFakeTimers();
  jest
    .mocked(getAdressByZipCode)
    .mockReset()
    .mockResolvedValue({ localidade: 'São Paulo', uf: 'SP' } as never);
  jest
    .mocked(registrationService.schools)
    .mockReset()
    .mockResolvedValue([{ id: '1', name: 'Escola' }]);
});
afterEach(() => jest.useRealTimers());

it('limpa dependências de um CEP incompleto sem consultar serviços', () => {
  const { result } = mount('123');
  expect(result.current.form.getValues()).toMatchObject({
    city: '',
    state: '',
    schoolId: '',
  });
  expect(result.current.location).toMatchObject({
    ready: false,
    loading: false,
    schools: [],
  });
  expect(getAdressByZipCode).not.toHaveBeenCalled();
});

it('busca CEP normalizado após debounce e preenche cidade, estado e escolas', async () => {
  const { result } = mount('01001-000');
  expect(result.current.location.loading).toBe(true);
  act(() => jest.advanceTimersByTime(399));
  expect(getAdressByZipCode).not.toHaveBeenCalled();
  await act(async () => jest.advanceTimersByTime(1));
  expect(getAdressByZipCode).toHaveBeenCalledWith('01001000');
  expect(registrationService.schools).toHaveBeenCalledWith('São Paulo', 'SP');
  expect(result.current.form.getValues()).toMatchObject({
    city: 'São Paulo',
    state: 'SP',
    schoolId: '',
  });
  expect(result.current.location).toMatchObject({
    ready: true,
    loading: false,
    schools: [{ id: '1', name: 'Escola' }],
  });
});

it('expõe erro e refaz a consulta ao tentar novamente', async () => {
  jest
    .mocked(getAdressByZipCode)
    .mockRejectedValueOnce(new Error('CEP não encontrado'));
  const { result } = mount('01001000');
  await act(async () => jest.advanceTimersByTime(400));
  expect(result.current.location.error).toBe('CEP não encontrado');
  expect(result.current.location.ready).toBe(false);
  act(() => result.current.location.retry());
  await act(async () => jest.advanceTimersByTime(400));
  expect(result.current.location.ready).toBe(true);
  expect(result.current.location.error).toBe('');
});

it('ignora resposta antiga quando o CEP muda durante a consulta', async () => {
  let resolveOld!: (value: never) => void;
  jest.mocked(getAdressByZipCode).mockReturnValueOnce(
    new Promise(resolve => {
      resolveOld = resolve;
    }),
  );
  const { result } = mount('01001000');
  await act(async () => jest.advanceTimersByTime(400));
  act(() => result.current.form.setValue('cep', '123'));
  await act(async () =>
    resolveOld({ localidade: 'Antiga', uf: 'RJ' } as never),
  );
  expect(result.current.form.getValues('city')).toBe('');
  expect(registrationService.schools).not.toHaveBeenCalled();
  expect(result.current.location.ready).toBe(false);
});
