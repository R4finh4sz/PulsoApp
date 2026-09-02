import { useRouter } from 'expo-router';
import { deleteItemAsync, getItemAsync, setItemAsync } from 'expo-secure-store';
import * as SplashScreen from 'expo-splash-screen';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';

import { IUser } from '@/interfaces/user';
import api from '@/services/api';
import {
  useFetchUser,
  useLogin,
  useRefreshAccessToken,
} from '@/services/login';
import { handleError } from '@/utils/handleError';
import queryClient from '@/utils/queryClient';
import { LoginForm } from '@/validation/Login.validation';

interface ProvideProps {
  user: IUser;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  login: (user: LoginForm) => Promise<void>;
  loading: boolean;
  fetchUser: () => Promise<void>;
}

interface Props {
  isAppReady: boolean;
}

const AuthContext = createContext({} as ProvideProps);

export const AuthProvider = ({
  children,
  isAppReady,
}: PropsWithChildren<Props>) => {
  const { mutateAsync: loginService } = useLogin();
  const { mutateAsync: refreshService } = useRefreshAccessToken();
  const { refetch } = useFetchUser();

  const router = useRouter();
  const [user, setUser] = useState<IUser>({} as IUser);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = user.id !== undefined;

  const refreshAccessToken = async () => {
    const refreshToken = await getItemAsync('refreshToken');

    if (refreshToken) {
      try {
        const data = await refreshService(refreshToken);

        await setItemAsync('accessToken', data.jwt);

        await fetchUser();
        return data.jwt;
      } catch {
        deleteItemAsync('accessToken');
        deleteItemAsync('refreshToken');
      }
    }
  };

  api.interceptors.response.use(
    response => response,
    async error => {
      console.log(error);
      const originalRequest = error.config;
      if (error.message === 'Network Error') {
        return Promise.reject(new Error('Sem conexão com a internet!'));
      }
      if (error.code === 'ERR_SECURESTORE_ENCRYPT_FAILURE') {
        await deleteItemAsync('accessToken');
        await deleteItemAsync('refreshToken');
        return logout();
      }
      if (
        error?.response?.status === 401 &&
        originalRequest.url !== 'auth/local/refresh' &&
        !originalRequest.retry
      ) {
        originalRequest.retry = true;
        const accessToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      }
      return Promise.reject(error);
    },
  );

  useEffect(() => {
    refreshAccessToken().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (isAppReady && !loading) {
      SplashScreen.hideAsync();
    }
  }, [isAppReady, loading]);

  const fetchUser = async () => {
    const { data } = await refetch();

    if (data) {
      setUser(data);
    }
  };

  const login = async (form: LoginForm) => {
    try {
      const data = await loginService(form);

      await setItemAsync('accessToken', data.jwt);
      if (data.refreshToken && form?.requestRefresh) {
        await setItemAsync('refreshToken', data.refreshToken);
      }

      await fetchUser();

      router.replace('/(main)/home');
    } catch (err) {
      await deleteItemAsync('accessToken');
      await deleteItemAsync('refreshToken');
      handleError(err);
    }
  };

  const logout = async () => {
    setUser({} as IUser);
    await deleteItemAsync('accessToken');
    await deleteItemAsync('refreshToken');
    queryClient.removeQueries();
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, logout, login, loading, fetchUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export default useAuth;
