import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { deleteItemAsync } from 'expo-secure-store';
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

// A sessão mock dura apenas até fechar ou recarregar o app.
const MOCK_USER_KEY = 'mockUser';
// Código temporário para testar sucesso e erro sem o backend.
const MOCK_OTP_CODE = '123456';
const STUDENT_ROLE_ID = 4;

type OTPPayload = {
  email: string;
  code: string;
  challengeId: string;
};

type ContextValues = {
  user: TUser | null;
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
    setUser(null);
    setOTPData({
      email,
      challengeId: `mock-challenge-${Date.now()}`,
    });
    router.replace('/(auth)/2Auth');
  };

  const completeLogin = async ({ email, code, challengeId }: OTPPayload) => {
    const pendingOTP = useOTPStore.getState().otpData;
    if (
      !pendingOTP ||
      pendingOTP.email !== email ||
      pendingOTP.challengeId !== challengeId ||
      code !== MOCK_OTP_CODE
    ) {
      throw new Error('Codigo de verificacao invalido');
    }

    const mockUser = createMockStudent(email);

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
    if (!isAppReady) {
      return;
    }

    const resetMockSession = async () => {
      try {
        // Remove também a sessão persistida pelas versões anteriores do mock.
        await clearSession();
      } finally {
        setUser(null);
        clearOTPData();
        setLoading(false);
      }
    };

    resetMockSession().catch(() => {
      // A sessão em memória já foi limpa mesmo se o armazenamento falhar.
    });
  }, [isAppReady]);

  return (
    <AuthContext.Provider
      value={{
        user,
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
