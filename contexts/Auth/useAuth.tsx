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
import { useOTPStore } from '@/store/otpStore';
import { LoginForm } from '@/validation/Login.validation';

const MOCK_TOKEN = 'mock-student-access-token';
const MOCK_USER_KEY = 'mockUser';
const STUDENT_ROLE_ID = 4;

type OTPPayload = {
  email: string;
  code: string;
  challengeId: string;
};

type ContextValues = {
  user: TUser | null;
  isAuthenticated: boolean;
  login: (form: LoginForm) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  completeLogin: (payload: OTPPayload) => Promise<void>;
  resendOTPCode: (payload: Omit<OTPPayload, 'code'>) => Promise<void>;
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
  const { setOTPData, clearOTPData } = useOTPStore();
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

  const login = async ({ email }: LoginForm) => {
    setOTPData({
      email,
      challengeId: `mock-challenge-${Date.now()}`,
    });
    router.replace('/(auth)/2Auth');
  };

  const completeLogin = async ({ email, code }: OTPPayload) => {
    if (code.length < 6) {
      throw new Error('Codigo de verificacao invalido');
    }

    const mockUser = createMockStudent(email);
    await setItemAsync('accessToken', MOCK_TOKEN);
    await setItemAsync(MOCK_USER_KEY, JSON.stringify(mockUser));
    clearOTPData();
    setUser(mockUser);
  };

  const resendOTPCode = async ({ email }: Omit<OTPPayload, 'code'>) => {
    setOTPData({
      email,
      challengeId: `mock-challenge-${Date.now()}`,
    });
  };

  const logout = async () => {
    await clearSession();
    clearOTPData();
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
        completeLogin,
        resendOTPCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default useAuth;
