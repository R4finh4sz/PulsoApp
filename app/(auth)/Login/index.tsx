import { LoginFields } from '@/components/screens/Login/LoginFields';
import { LoginHeader } from '@/components/screens/Login/LoginHeader';
import { LoginIntro } from '@/components/screens/Login/LoginIntro';
import useAuth from '@/contexts/Auth/useAuth';
import { useErrorModal } from '@/store/errorModalStore';
import { LoginForm, LoginSchema } from '@/validation/Login.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams } from 'expo-router';
import { SubmitHandler, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Login = () => {
  const { login } = useAuth();
  const { animateLogo } = useLocalSearchParams<{ animateLogo?: string }>();
  const { openErrorModal } = useErrorModal();
  const insets = useSafeAreaInsets();

  const { control, handleSubmit } = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: __DEV__ ? 'spgustavorisio@gmail.com' : '',
      password: __DEV__ ? 'Teste@123' : '',
      rememberMe: false,
    },
  });

  const onSubmit: SubmitHandler<LoginForm> = async data => {
    try {
      await login(data);
      // Se o 2FA foi disparado, o modal OTP já foi aberto pelo contexto.
      // Se não há 2FA, a navegação para home acontece via useEffect do contexto.
    } catch (error: any) {
      // O erro de "Role não permitida" já abre o ErrorModal internamente no contexto.
      // Aqui capturamos apenas outros erros de rede/credenciais.
      if (error?.message !== 'Role não permitida') {
        openErrorModal({
          title: 'Dados incorretos',
          message:
            'E-mail ou senha incorretos.\nVerifique os dados informados e tente novamente.',
          buttonText: 'Tentar novamente',
        });
      }
    }
  };

  return (
    <>
      <KeyboardAwareScrollView
        className="flex-1 bg-white"
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

          <LoginFields control={control} onSubmit={handleSubmit(onSubmit)} />
        </View>
      </KeyboardAwareScrollView>
    </>
  );
};

export default Login;
