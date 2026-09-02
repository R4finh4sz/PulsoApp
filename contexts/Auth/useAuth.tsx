import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { deleteItemAsync, setItemAsync } from 'expo-secure-store';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';

import { TUser } from '@/interfaces/user';
import { authService } from '@/services/api/auth';
import { useErrorModal } from '@/store/errorModalStore';
import { useOTPStore } from '@/store/otpStore';
import { LoginForm } from '@/validation/Login.validation';

const ALLOWED_ROLE_ID = 3;

type ContextValues = {
  user: TUser | null;
  login: (form: LoginForm) => Promise<void>;
  logout: (isDelete?: boolean) => Promise<void>;
  acceptTerms: () => void;
  loading: boolean;
  completeLogin: (payload: {
    email: string;
    code: string;
    challengeId: string;
  }) => Promise<void>;
  resendOTPCode: (payload: {
    email: string;
    challengeId: string;
  }) => Promise<void>;
};

type Props = {
  isAppReady: boolean;
};

const AuthContext = createContext({} as ContextValues);

export const AuthProvider = ({
  children,
  isAppReady,
}: PropsWithChildren<Props>) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { openErrorModal } = useErrorModal();
  const { setOTPData, clearOTPData } = useOTPStore();

  const [user, setUser] = useState<TUser | null>(null);
  const [loading, setLoading] = useState(true);

  const mapUser = (payload: unknown): TUser => {
    const user = (payload || {}) as Record<string, unknown>;

    return {
      id: Number(user.id || 0),
      documentId: String(user.documentId || user.document || ''),
      name: String(
        user.name || user.fullName || user.username || user.email || '',
      ),
    };
  };

  const getAccessToken = (payload: Record<string, unknown>): string => {
    const token = payload.accessToken || payload.jwt || payload.token;
    return typeof token === 'string' ? token : '';
  };

  const login = async (form: LoginForm) => {
    const response = await authService.login(form);
    const responseData = response?.data ?? (response as any);

    // Verifica se o usuário tem a role permitida
    const roleId = responseData?.user?.role?.id;
    if (roleId !== ALLOWED_ROLE_ID) {
      openErrorModal({
        title: 'Acesso negado',
        message:
          'Seu perfil não tem permissão para acessar este aplicativo.\nApenas usuários autorizados podem entrar.',
        buttonText: 'Entendi',
      });
      throw new Error('Role não permitida');
    }

    // Se requer 2FA, navega para a tela OTP
    if (responseData?.requiresTwoFactor) {
      setOTPData({
        email: form.email,
        challengeId: responseData.challengeId,
      });
      router.push('/(auth)/otp');
      return;
    }

    // Caso venha accessToken direto (sem 2FA)
    const accessToken = getAccessToken(responseData);
    if (!accessToken) {
      throw new Error('Token de acesso não retornado pela API');
    }

    await setItemAsync('accessToken', accessToken);

    if (responseData.user) {
      setUser(mapUser(responseData.user));
      return;
    }

    const me = await authService.fetchUser();
    setUser(mapUser(me));
  };

  /**
   * Chamado após a confirmação do código OTP
   */
  const completeLogin = async (payload: {
    email: string;
    code: string;
    challengeId: string;
  }) => {
    try {
      const response = await authService.verifyCode(payload);
      const responseData = response?.data ?? (response as any);

      const accessToken = getAccessToken(responseData);
      if (!accessToken) {
        throw new Error(
          'Token de acesso não retornado após verificação do código',
        );
      }

      await setItemAsync('accessToken', accessToken);
      clearOTPData();

      if (responseData.user) {
        setUser(mapUser(responseData.user));
        return;
      }

      const me = await authService.fetchUser();
      setUser(mapUser(me));
    } catch (error: any) {
      const message =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        'O código informado é inválido ou expirou.\nVerifique e tente novamente.';

      openErrorModal({
        title: 'Erro!',
        message,
        buttonText: 'Tentar novamente',
      });
      throw error;
    }
  };

  /**
   * Reenvia o código OTP para o e-mail do usuário
   */
  const resendOTPCode = async (payload: {
    email: string;
    challengeId: string;
  }) => {
    const response = await authService.resendCode(payload);
    const responseData = response?.data ?? (response as any);

    // Atualiza o challengeId no store caso ele mude no reenvio
    if (responseData?.challengeId) {
      setOTPData({
        email: payload.email,
        challengeId: responseData.challengeId,
      });
    }
  };

  const logout = async (isDelete = true) => {
    try {
      if (isDelete) {
        await deleteItemAsync('accessToken');
      }
    } catch (error) {
      console.error('Erro ao deletar tokens:', error);
    } finally {
      queryClient.clear();
      setUser(null);
      router.replace('/(auth)/Login');
    }
  };

  const acceptTerms = () => {};

  useEffect(() => {
    if (isAppReady) {
      setLoading(false);
    }
  }, [isAppReady]);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/(main)/Home');
    }
  }, [user, loading]);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        acceptTerms,
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
