import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Platform } from 'react-native';

import { TUser } from '@/interfaces/user';
import { Credentials, setApiCredentials } from '@/services/api';
import { authService } from '@/services/auth';
import { useOTPStore } from '@/store/otpStore';
import { LoginForm } from '@/validation/Login.validation';

const SESSION_KEY = 'studentCredentials';
type OTPPayload = { email: string; code: string; challengeId: string };
type ContextValues = {
  user: TUser | null;
  login: (form: LoginForm) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  completeLogin: (payload: OTPPayload) => Promise<void>;
  resendOTPCode: (payload: Omit<OTPPayload, 'code'>) => Promise<void>;
};
const AuthContext = createContext({} as ContextValues);
const unsupportedOTP = async () => {
  throw new Error('Entre com seu e-mail e senha na tela de login.');
};
export const AuthProvider = ({
  children,
  isAppReady,
}: PropsWithChildren<{ isAppReady: boolean }>) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<TUser | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (form: LoginForm) => {
    const session = await authService.login(form);
    if (Platform.OS !== 'web') {
      if (form.rememberMe) {
        await SecureStore.setItemAsync(
          SESSION_KEY,
          JSON.stringify(session.credentials),
        );
      } else {
        await SecureStore.deleteItemAsync(SESSION_KEY);
      }
    }
    await queryClient.cancelQueries();
    queryClient.clear();
    useOTPStore.getState().clearOTPData();
    setApiCredentials(session.credentials);
    setUser(session.user);
    router.replace('/(main)/Home');
  };
  const logout = async () => {
    setApiCredentials(null);
    setUser(null);
    useOTPStore.getState().clearOTPData();
    await queryClient.cancelQueries();
    queryClient.clear();
    try {
      if (Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync(SESSION_KEY);
      }
    } finally {
      router.replace('/(auth)/Login');
    }
  };
  useEffect(() => {
    if (!isAppReady) {
      return;
    }
    let active = true;
    const restore = async () => {
      try {
        if (Platform.OS === 'web') {
          return;
        }
        const stored = await SecureStore.getItemAsync(SESSION_KEY);
        if (!stored || !active) {
          return;
        }
        const credentials: Credentials = JSON.parse(stored);
        if (
          typeof credentials.username !== 'string' ||
          typeof credentials.password !== 'string'
        ) {
          return;
        }
        setApiCredentials(credentials);
        const currentUser = await authService.fetchUser();
        if (active) {
          setUser(currentUser);
        }
      } catch {
        if (active) {
          setApiCredentials(null);
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
  }, [isAppReady]);
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        completeLogin: unsupportedOTP,
        resendOTPCode: unsupportedOTP,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);
export default useAuth;
