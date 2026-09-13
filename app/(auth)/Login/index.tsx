import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import { SubmitHandler, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoginFields } from '@/components/screens/Login/LoginFields';
import { LoginHeader } from '@/components/screens/Login/LoginHeader';
import { LoginIntro } from '@/components/screens/Login/LoginIntro';
import useAuth from '@/contexts/Auth/useAuth';
import { useErrorModal } from '@/store/errorModalStore';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { LoginForm, LoginSchema } from '@/validation/Login.validation';

const Login = () => {
  const { login } = useAuth();
  const { animateLogo } = useLocalSearchParams<{ animateLogo?: string }>();
  const { openErrorModal } = useErrorModal();
  const insets = useSafeAreaInsets();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit: SubmitHandler<LoginForm> = async data => {
    try {
      await login(data);
    } catch (error) {
      openErrorModal({
        title: 'Não foi possível entrar',
        message:
          axios.isAxiosError(error) && error.response?.status === 401
            ? 'E-mail ou senha incorretos. Verifique os dados e tente novamente.'
            : getErrorMessage(
                error,
                'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
              ),
        buttonText: 'Tentar novamente',
      });
    }
  };

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-[#F5F5F5]"
      contentContainerStyle={{
        paddingBottom: Math.max(insets.bottom + 10),
        paddingTop: Math.max(insets.top + 10),
        flexGrow: 1,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <LoginHeader shouldAnimate={animateLogo === '1'} />

      <View className="px-4">
        <LoginIntro />

        <LoginFields
          control={control}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit(onSubmit)}
        />
      </View>
    </KeyboardAwareScrollView>
  );
};

export default Login;
