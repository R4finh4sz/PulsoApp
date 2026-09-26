import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Platform } from 'react-native';

import { TUser } from '@/interfaces/user';
import api, { setApiToken } from '@/services/api';
import { authService } from '@/services/auth';
import { useOTPStore } from '@/store/otpStore';
import { LoginForm } from '@/validation/Login.validation';

const SESSION_KEY = 'studentTokenSession';
type Session = { accessToken: string; expiresAt: string };
const storage = {
  read: async () =>
    Platform.OS === 'web'
      ? sessionStorage.getItem(SESSION_KEY)
      : SecureStore.getItemAsync(SESSION_KEY),
  write: async (session: Session) => {
    const value = JSON.stringify({
      accessToken: session.accessToken,
      expiresAt: session.expiresAt,
    });
    if (Platform.OS === 'web') {
      sessionStorage.setItem(SESSION_KEY, value);
    } else {
      await SecureStore.setItemAsync(SESSION_KEY, value);
    }
  },
  clear: async () => {
    if (Platform.OS === 'web') {
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      await SecureStore.deleteItemAsync(SESSION_KEY);
      await SecureStore.deleteItemAsync('studentCredentials');
    }
  },
};
type ContextValues = {
  user: TUser | null;
  login: (form: LoginForm) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  restoreError: string | null;
  retryRestore: () => void;
  completeLogin: (payload: { code: string }) => Promise<void>;
  resendOTPCode: () => Promise<void>;
};
const AuthContext = createContext({} as ContextValues);
export const AuthProvider = ({
  children,
  isAppReady,
}: PropsWithChildren<{ isAppReady: boolean }>) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<TUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreAttempt, setRestoreAttempt] = useState(0);
  const pending = useRef<
    (Session & { rememberMe: boolean; verified: boolean }) | null
  >(null);

  const finishLogin = async () => {
    const session = pending.current;
    if (!session) {
      throw new Error('Sua sessão expirou. Entre novamente.');
    }
    const currentUser = await authService.fetchUser();
    if (session.rememberMe) {
      await storage.write(session);
    }
    await queryClient.cancelQueries();
    queryClient.clear();
    useOTPStore.getState().clearOTPData();
    pending.current = null;
    setUser(currentUser);
  };
  const login = async (form: LoginForm) => {
    await storage.clear();
    setApiToken(null);
    pending.current = null;
    useOTPStore.getState().clearOTPData();
    const response = await authService.login(form);
    setApiToken(response.accessToken);
    if (response.user.role !== 'STUDENT') {
      try {
        await authService.logout();
      } finally {
        setApiToken(null);
      }
      throw new Error(
        'Este aplicativo é destinado aos alunos. Use uma conta de aluno.',
      );
    }
    pending.current = {
      accessToken: response.accessToken,
      expiresAt: response.expiresAt,
      rememberMe: form.rememberMe,
      verified: !response.twoFactorRequired,
    };
    if (response.twoFactorRequired) {
      useOTPStore.getState().setOTPData({
        email: form.email.trim(),
        codeExpiresAt: response.codeExpiresAt,
        resendAvailableAt: response.resendAvailableAt,
      });
      router.replace('/(auth)/2Auth');
    } else {
      await finishLogin();
    }
  };
  const completeLogin = async ({ code }: { code: string }) => {
    if (!pending.current) {
      throw new Error('Sua sessão expirou. Entre novamente.');
    }
    if (!pending.current.verified) {
      await authService.verify(code);
      pending.current.verified = true;
    }
    await finishLogin();
  };
  const resendOTPCode = async () => {
    const data = useOTPStore.getState().otpData;
    if (!data || !pending.current || pending.current.verified) {
      throw new Error('Entre novamente para solicitar um código.');
    }
    const response = await authService.resend();
    useOTPStore.getState().setOTPData({
      ...data,
      codeExpiresAt: response.codeExpiresAt,
      resendAvailableAt: response.resendAvailableAt,
    });
  };
  const clearSession = async () => {
    setApiToken(null);
    pending.current = null;
    setUser(null);
    useOTPStore.getState().clearOTPData();
    await queryClient.cancelQueries();
    queryClient.clear();
    await storage.clear();
  };
  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      await clearSession();
    }
  };
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      response => response,
      async error => {
        if (
          error.response?.status === 401 &&
          error.config?.url !== '/auth/login'
        ) {
          await clearSession();
        }
        return Promise.reject(error);
      },
    );
    return () => api.interceptors.response.eject(interceptor);
    // The interceptor only uses stable setters and the query client.
  }, [queryClient]);
  useEffect(() => {
    if (!isAppReady) {
      return;
    }
    let active = true;
    const restore = async () => {
      setLoading(true);
      setRestoreError(null);
      try {
        if (Platform.OS !== 'web') {
          await SecureStore.deleteItemAsync('studentCredentials');
        }
        const stored = await storage.read();
        if (!stored || !active) {
          return;
        }
        let session: Session;
        try {
          session = JSON.parse(stored);
        } catch {
          await storage.clear();
          return;
        }
        if (
          !session ||
          typeof session.accessToken !== 'string' ||
          !session.accessToken ||
          !Number.isFinite(Date.parse(session.expiresAt)) ||
          Date.parse(session.expiresAt) <= Date.now()
        ) {
          await storage.clear();
          return;
        }
        setApiToken(session.accessToken);
        const currentUser = await authService.fetchUser();
        if (active) {
          setUser(currentUser);
        }
      } catch (error) {
        if (active) {
          setApiToken(null);
          if (
            axios.isAxiosError(error) &&
            [401, 403].includes(error.response?.status ?? 0)
          ) {
            await storage.clear();
          } else {
            setRestoreError(
              'Não foi possível restaurar sua sessão. Verifique sua conexão e tente novamente.',
            );
          }
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    restore();
    return () => {
      active = false;
    };
  }, [isAppReady, restoreAttempt]);
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        completeLogin,
        resendOTPCode,
        restoreError,
        retryRestore: () => setRestoreAttempt(value => value + 1),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);
export default useAuth;
