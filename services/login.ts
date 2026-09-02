import { useMutation, useQuery } from '@tanstack/react-query';

import { ILoginResponse, IUser } from '@/interfaces/user';
import { LoginForm } from '@/validation/Login.validation';

// import api from './api.service';

export const useLogin = () => {
  const login = async (form: LoginForm) => {
    // const { data } = await api.post<ILoginResponse>('auth/local', form);

    // return data;

    const mockData: ILoginResponse = {
      jwt: 'mocked-jwt-token',
      refreshToken: 'mocked-refresh-token',
      user: {
        id: 1,
        email: form.identifier,
        name: 'John Doe',
        cpf: '12345678901',
        phone: '1234567890',
        documentId: '1234567890',
      },
    };

    return mockData;
  };

  return useMutation({
    mutationKey: ['login-user'],
    mutationFn: login,
  });
};

export const useRefreshAccessToken = () => {
  const refreshAccessToken = async (refreshToken: string) => {
    // const { data } = await api.post<{ jwt: string }>('auth/local/refresh', {
    //   refreshToken,
    // });

    // return data;

    const mockData = {
      jwt: refreshToken,
    };

    return mockData;
  };

  return useMutation({
    mutationKey: ['refresh-access-token'],
    mutationFn: refreshAccessToken,
  });
};

export const useFetchUser = () => {
  const fetchUser = async () => {
    // const { data } = await api.get<IUser>('getMyCompanyClientData');

    // return data;

    const mockData: IUser = {
      id: 1,
      documentId: '1234567890',
      name: 'John Doe',
      cpf: '12345678901',
      phone: '1234567890',
      email: 'john.doe@example.com',
    };

    return mockData;
  };

  return useQuery({
    queryKey: ['fetch-user'],
    queryFn: fetchUser,
    enabled: false,
  });
};
