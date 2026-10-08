import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { usePathname } from 'expo-router';
import * as Updates from 'expo-updates';
import { PropsWithChildren } from 'react';

import useAuth from '@/contexts/Auth/useAuth';
import { useDimensions } from '@/contexts/common/useDimension';
import { useUpdate as useCommonUpdate } from '@/contexts/common/useUpdate';
import useDebounce from '@/hooks/useDebounce';
import useDisableDelay from '@/hooks/useDisableDelay';
import { useStudentClassrooms } from '@/hooks/useStudentClassrooms';
import useUpdate from '@/hooks/useUpdate';
import { classroomService } from '@/services/classrooms';
import { useDropdown, useDropdownRouteReset } from '@/store/dropdownStore';
import { handleSuccess } from '@/utils/handleError';

jest.mock('@/contexts/Auth/useAuth', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('@/services/classrooms', () => ({
  classroomService: { list: jest.fn(), schoolCourses: jest.fn() },
}));
jest.mock('@/utils/handleError', () => ({ handleSuccess: jest.fn() }));
jest.mock('expo-updates', () => ({
  checkForUpdateAsync: jest.fn(),
  fetchUpdateAsync: jest.fn(),
  reloadAsync: jest.fn(),
}));

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

it('debounce cancela o valor anterior e só publica o último após o prazo', () => {
  jest.useFakeTimers();
  const { result, rerender, unmount } = renderHook(
    ({ value }) => useDebounce(value, 400),
    { initialProps: { value: 'first' } },
  );
  rerender({ value: 'second' });
  act(() => jest.advanceTimersByTime(200));
  rerender({ value: 'last' });
  act(() => jest.advanceTimersByTime(399));
  expect(result.current).toBe('first');
  act(() => jest.advanceTimersByTime(1));
  expect(result.current).toBe('last');
  unmount();
  expect(jest.getTimerCount()).toBe(0);
});

it('bloqueia ações repetidas durante o intervalo e libera após erro', async () => {
  jest.useFakeTimers();
  const { result } = renderHook(() => useDisableDelay(400));
  const action = jest.fn();
  await act(async () => result.current.executeWithDelay(action));
  expect(result.current.isLoading).toBe(true);
  await act(async () => result.current.executeWithDelay(action));
  expect(action).toHaveBeenCalledTimes(1);
  act(() => jest.advanceTimersByTime(400));
  expect(result.current.isLoading).toBe(false);
  await act(async () => {
    await expect(
      result.current.executeWithDelay(() => {
        throw new Error('Falha');
      }),
    ).rejects.toThrow('Falha');
  });
  act(() => jest.advanceTimersByTime(400));
  expect(result.current.isLoading).toBe(false);
});

it('calcula as dimensões disponíveis considerando a área segura', () => {
  const { result } = renderHook(useDimensions);
  expect(result.current.safeWidth).toBe(
    result.current.width -
      result.current.insets.left -
      result.current.insets.right,
  );
  expect(result.current.safeHeight).toBe(
    result.current.height -
      result.current.insets.top -
      result.current.insets.bottom,
  );
});

it('limpa o dropdown quando a rota muda', () => {
  const { rerender } = renderHook(useDropdownRouteReset);
  act(() => useDropdown.getState().setDropDownKey('school'));
  expect(useDropdown.getState().dropDownKey).toBe('school');
  jest.mocked(usePathname).mockReturnValue('/Teams');
  rerender({});
  expect(useDropdown.getState().dropDownKey).toBe('');
});

const wrapper = ({ children }: PropsWithChildren) => (
  <QueryClientProvider
    client={
      new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: 0 } },
      })
    }
  >
    {children}
  </QueryClientProvider>
);

it('carrega as matérias de cada turma do aluno', async () => {
  jest.mocked(useAuth).mockReturnValue({ user: { id: 7 } } as never);
  jest
    .mocked(classroomService.list)
    .mockResolvedValue([{ id: 1 }, { id: 2 }] as never);
  jest
    .mocked(classroomService.schoolCourses)
    .mockImplementation(
      async id => [{ id: id * 10, classroomId: id }] as never,
    );
  const { result } = renderHook(useStudentClassrooms, { wrapper });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toEqual([
    { id: 1, schoolCourses: [{ id: 10, classroomId: 1 }] },
    { id: 2, schoolCourses: [{ id: 20, classroomId: 2 }] },
  ]);
});

it('não consulta turmas sem usuário autenticado', () => {
  jest.mocked(useAuth).mockReturnValue({ user: null } as never);
  const { result } = renderHook(useStudentClassrooms, { wrapper });
  expect(result.current.fetchStatus).toBe('idle');
  expect(classroomService.list).not.toHaveBeenCalled();
});

describe.each([
  ['principal', useUpdate],
  ['comum', useCommonUpdate],
])('atualizações: %s', (_, hook) => {
  it.each([true, false])(
    'verifica atualização disponível (%s)',
    async isAvailable => {
      jest.replaceProperty(globalThis, '__DEV__' as never, false as never);
      jest
        .mocked(Updates.checkForUpdateAsync)
        .mockResolvedValue({ isAvailable } as never);
      const { result } = renderHook(hook);
      await waitFor(() => expect(result.current).toBe(false));
      expect(Updates.checkForUpdateAsync).toHaveBeenCalled();
      expect(Updates.fetchUpdateAsync).toHaveBeenCalledTimes(
        isAvailable ? 1 : 0,
      );
      expect(Updates.reloadAsync).toHaveBeenCalledTimes(isAvailable ? 1 : 0);
      if (isAvailable) {
        expect(handleSuccess).toHaveBeenCalledWith('Aplicativo Atualizando');
      }
    },
  );

  it('não consulta atualizações em desenvolvimento', () => {
    jest.replaceProperty(globalThis, '__DEV__' as never, true as never);
    renderHook(hook);
    expect(Updates.checkForUpdateAsync).not.toHaveBeenCalled();
  });
});

it('encerra o loading da atualização comum após falha', async () => {
  jest.replaceProperty(globalThis, '__DEV__' as never, false as never);
  const errorLog = jest.spyOn(console, 'error').mockImplementation(() => {});
  jest
    .mocked(Updates.checkForUpdateAsync)
    .mockRejectedValueOnce(new Error('Offline'));
  const { result } = renderHook(useCommonUpdate);
  await waitFor(() => expect(result.current).toBe(false));
  expect(errorLog).toHaveBeenCalledWith(
    'Erro ao verificar atualizações:',
    expect.any(Error),
  );
});
