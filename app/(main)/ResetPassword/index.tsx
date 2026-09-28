import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { ShieldCheck } from 'lucide-react-native';
import { useForm } from 'react-hook-form';
import { Keyboard, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { PasswordRequirements } from '@/components/screens/ForgotPassword/PasswordRequirements';
import { ResetPasswordField } from '@/components/screens/Profile/ResetPasswordField';
import { BackButton } from '@/components/ui/BackButton';
import Pressable from '@/components/ui/Pressable';
import {
  ChangePasswordForm,
  changePasswordSchema,
} from '@/validation/ForgotPassword.validation';

const ResetPasswordScreen = () => {
  const {
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
    defaultValues: { password: '', confirmPassword: '' },
  });
  const onSubmit = handleSubmit(() => {
    Keyboard.dismiss();
    setError('root', {
      message:
        'A alteração de senha ainda não está disponível. Tente novamente mais tarde.',
    });
  });

  return (
    <KeyboardAwareScrollView
      className="flex-1"
      contentContainerClassName="grow px-6 pb-10 pt-8 bg-neutral-background"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View className="w-full max-w-[560px] flex-1 self-center">
        <BackButton
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.replace('/(main)/Profile')
          }
        />

        <View className="mt-12 items-center">
          <View className="mb-3 h-[72px] w-[72px] items-center justify-center rounded-3xl bg-[#E7FAFD]">
            <ShieldCheck color="#0095B3" size={36} strokeWidth={1.7} />
          </View>

          <Text
            accessibilityRole="header"
            className="font-poppins_bold text-xl text-[#253044]"
          >
            Redefinir senha
          </Text>

          <Text className="mt-3 px-6 text-center font-poppins text-sm leading-5 text-[#70839D]">
            Atualize sua senha para manter sua conta segura. Crie uma senha
            forte, seguindo as orientações de segurança, e evite utilizar
            informações fáceis de descobrir.
          </Text>
        </View>

        <View className="gap-5">
          <ResetPasswordField
            control={control}
            label="Senha"
            name="password"
            placeholder="Digite sua senha"
          />

          <PasswordRequirements
            password={watch('password')}
            variant="profile"
          />

          <ResetPasswordField
            control={control}
            label="Confirmar senha"
            name="confirmPassword"
            placeholder="Digite sua senha novamente"
            onSubmit={onSubmit}
          />
        </View>

        <View className="mt-16 pb-12">
          {errors.root && (
            <Text
              accessibilityRole="alert"
              className="mb-3 text-center font-poppins text-xs text-alert-error-primary"
            >
              {errors.root.message}
            </Text>
          )}

          <Pressable
            accessibilityRole="button"
            className="min-h-10 items-center justify-center rounded-lg bg-[#0095B3] px-4 py-2 shadow-md"
            onPress={onSubmit}
          >
            <Text className="font-poppins_semibold text-base text-white">
              Salvar
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default ResetPasswordScreen;
