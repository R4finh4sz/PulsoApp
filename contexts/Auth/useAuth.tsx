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
import { isMockEnabled } from '@/services/mock';
import { useOTPStore } from '@/store/otpStore';
import { LoginForm } from '@/validation/Login.validation';

const SESSION_KEY = isMockEnabled
  ? 'studentMockSession'
  : 'studentTokenSession';
type Session = {
  accessToken: string;
  expiresAt: string;
  refreshToken?: string | null;
  refreshExpiresAt?: string | null;
  twoFactorRequired?: boolean;
};
const storage = {
  read: async () =>
    Platform.OS === 'web'
      ? sessionStorage.getItem(SESSION_KEY)
      : SecureStore.getItemAsync(SESSION_KEY),
  write: async (session: Session) => {
    const value = JSON.stringify({
      accessToken: session.accessToken,
      expiresAt: session.expiresAt,
      refreshToken: session.refreshToken,
      refreshExpiresAt: session.refreshExpiresAt,
      twoFactorRequired: session.twoFactorRequired,
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
  twoFactorRequired: boolean | null;
  updateTwoFactor: (enabled: boolean, currentPassword: string) => Promise<void>;
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
  const [twoFactorRequired, setTwoFactorRequired] = useState<boolean | null>(
    null,
  );
  const rememberedSession = useRef<Session | null>(null);
  const currentSession = useRef<Session | null>(null);
  const refreshing = useRef<Promise<Session> | null>(null);
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
    currentSession.current = session;
    if (session.rememberMe) {
      await storage.write(session);
      rememberedSession.current = session;
    }
    await queryClient.cancelQueries();
    queryClient.clear();
    useOTPStore.getState().clearOTPData();
    pending.current = null;
    setTwoFactorRequired(session.twoFactorRequired ?? null);
    setUser(currentUser);
  };
  const login = async (form: LoginForm) => {
    currentSession.current = null;
    rememberedSession.current = null;
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
      refreshToken: response.refreshToken,
      refreshExpiresAt: response.refreshExpiresAt,
      twoFactorRequired: response.twoFactorRequired,
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
    currentSession.current = null;
    rememberedSession.current = null;
    setApiToken(null);
    pending.current = null;
    setUser(null);
    setTwoFactorRequired(null);
    useOTPStore.getState().clearOTPData();
    await queryClient.cancelQueries();
    queryClient.clear();
    await storage.clear();
  };
  const refreshSession = (): Promise<Session> => {
    if (refreshing.current) {
      return refreshing.current;
    }
    const session = currentSession.current;
    if (
      !session?.refreshToken ||
      (session.refreshExpiresAt &&
        Date.parse(session.refreshExpiresAt) <= Date.now())
    ) {
      return clearSession().then(() => {
        throw new Error('Sua sessão expirou. Entre novamente.');
      });
    }
    refreshing.current = (async () => {
      try {
        const response = await authService.refresh(session.refreshToken!);
        if (currentSession.current !== session) {
          throw new Error('Sua sessão foi encerrada.');
        }
        const renewed: Session = {
          accessToken: response.accessToken,
          expiresAt: response.expiresAt,
          refreshToken: response.refreshToken,
          refreshExpiresAt: response.refreshExpiresAt,
          twoFactorRequired: session.twoFactorRequired,
        };
        if (rememberedSession.current) {
          await storage.write(renewed);
          rememberedSession.current = renewed;
        }
        currentSession.current = renewed;
        setApiToken(renewed.accessToken);
        return renewed;
      } catch (error) {
        if (currentSession.current === session) {
          await clearSession();
        }
        throw error;
      } finally {
        refreshing.current = null;
      }
    })();
    return refreshing.current;
  };
  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      await clearSession();
    }
  };
  const updateTwoFactor = async (enabled: boolean, currentPassword: string) => {
    await authService.updateTwoFactor({ enabled, currentPassword });
    setTwoFactorRequired(enabled);
    if (currentSession.current) {
      currentSession.current.twoFactorRequired = enabled;
    }
    if (rememberedSession.current) {
      rememberedSession.current = {
        ...rememberedSession.current,
        twoFactorRequired: enabled,
      };
      await storage.write(rememberedSession.current);
    }
  };
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      response => response,
      async error => {
        const { config } = error;
        if (
          error.response?.status === 401 &&
          config?.url !== '/auth/login' &&
          config?.url !== '/auth/refresh'
        ) {
          if (config && !config.authRetried && currentSession.current) {
            config.authRetried = true;
            try {
              const sentToken = config.headers?.Authorization;
              const session = currentSession.current;
              const renewed =
                sentToken && sentToken !== `Bearer ${session.accessToken}`
                  ? session
                  : await refreshSession();
              config.headers.Authorization = `Bearer ${renewed.accessToken}`;
              return api.request(config);
            } catch (refreshError) {
              return Promise.reject(refreshError);
            }
          }
          await clearSession();
        }
        return Promise.reject(error);
      },
    );
    return () => api.interceptors.response.eject(interceptor);
    // Session state is read through refs so simultaneous 401s share one refresh.
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
          (Date.parse(session.expiresAt) <= Date.now() && !session.refreshToken)
        ) {
          await storage.clear();
          return;
        }
        currentSession.current = session;
        rememberedSession.current = session;
        if (Date.parse(session.expiresAt) <= Date.now()) {
          session = await refreshSession();
        }
        setApiToken(session.accessToken);
        const currentUser = await authService.fetchUser();
        if (active) {
          session = currentSession.current ?? session;
          rememberedSession.current = session;
          setTwoFactorRequired(
            typeof session.twoFactorRequired === 'boolean'
              ? session.twoFactorRequired
              : null,
          );
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
        twoFactorRequired,
        updateTwoFactor,
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
