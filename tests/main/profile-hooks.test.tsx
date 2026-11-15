import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { PropsWithChildren } from 'react';

import useAuth from '@/contexts/Auth/useAuth';
import { useStudentPhoto, useStudentProfile } from '@/hooks/useStudentProfile';
import { profileService } from '@/services/profile';

jest.mock('@/contexts/Auth/useAuth', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('@/services/profile', () => ({
  profileService: { get: jest.fn(), photo: jest.fn() },
}));

const wrapper = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

it('compartilha a consulta da foto entre componentes e separa o cache por aluno', async () => {
  jest.mocked(useAuth).mockReturnValue({ user: { id: 1 } } as never);
  jest
    .mocked(profileService.photo)
    .mockResolvedValueOnce('photo-1')
    .mockResolvedValueOnce('photo-2');
  const hook = renderHook(() => [useStudentPhoto(), useStudentPhoto()], {
    wrapper: wrapper(),
  });
  await waitFor(() => expect(hook.result.current[0].data).toBe('photo-1'));
  expect(hook.result.current[1].data).toBe('photo-1');
  expect(profileService.photo).toHaveBeenCalledTimes(1);
  jest.mocked(useAuth).mockReturnValue({ user: { id: 2 } } as never);
  hook.rerender({});
  expect(hook.result.current[0].data).not.toBe('photo-1');
  await waitFor(() => expect(hook.result.current[0].data).toBe('photo-2'));
  expect(profileService.photo).toHaveBeenCalledTimes(2);
});

it('não busca perfil nem foto sem sessão autenticada', () => {
  jest.mocked(useAuth).mockReturnValue({ user: null } as never);
  renderHook(
    () => {
      useStudentPhoto();
      useStudentProfile();
    },
    { wrapper: wrapper() },
  );
  expect(profileService.photo).not.toHaveBeenCalled();
  expect(profileService.get).not.toHaveBeenCalled();
});
