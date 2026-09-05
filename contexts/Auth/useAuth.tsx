import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { deleteItemAsync, getItemAsync, setItemAsync } from 'expo-secure-store';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';

import { TUser } from '@/interfaces/user';
import { LoginForm } from '@/validation/Login.validation';

const MOCK_TOKEN = 'mock-student-access-token';
const MOCK_USER_KEY = 'mockUser';
const STUDENT_ROLE_ID = 4;

type ContextValues = {
  user: TUser | null;
  isAuthenticated: boolean;
  login: (form: LoginForm) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
};

type Props = { isAppReady: boolean };

const AuthContext = createContext({} as ContextValues);

const createMockStudent = (email: string): TUser => ({
  id: 1,
  documentId: 'mock-student-1',
  name: 'Aluno de Teste',
  email,
  role: { id: STUDENT_ROLE_ID },
});

export const AuthProvider = ({
  children,
  isAppReady,
}: PropsWithChildren<Props>) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<TUser | null>(null);
  const [loading, setLoading] = useState(true);

  const clearSession = async () => {
    await Promise.all([
      deleteItemAsync('accessToken'),
      deleteItemAsync('refreshToken'),
      deleteItemAsync(MOCK_USER_KEY),
    ]);
    queryClient.clear();
    setUser(null);
  };

  const login = async ({ email, rememberMe }: LoginForm) => {
    const mockUser = createMockStudent(email);

    await setItemAsync('accessToken', MOCK_TOKEN);
    await setItemAsync(MOCK_USER_KEY, JSON.stringify(mockUser));

    if (rememberMe) {
      await setItemAsync('refreshToken', 'mock-student-refresh-token');
    } else {
      await deleteItemAsync('refreshToken');
    }

    setUser(mockUser);
    router.replace('/(main)/Home');
  };

  const logout = async () => {
    await clearSession();
    router.replace('/(auth)/Login');
  };

  useEffect(() => {
    if (!isAppReady) return;

    const restoreSession = async () => {
      try {
        const [accessToken, storedUser] = await Promise.all([
          getItemAsync('accessToken'),
          getItemAsync(MOCK_USER_KEY),
        ]);

        if (accessToken === MOCK_TOKEN && storedUser) {
          const parsedUser = JSON.parse(storedUser) as TUser;

          if (parsedUser.role?.id === STUDENT_ROLE_ID) {
            setUser(parsedUser);
          } else {
            await clearSession();
          }
        } else {
          await clearSession();
        }
      } catch {
        await clearSession();
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [isAppReady]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default useAuth;
