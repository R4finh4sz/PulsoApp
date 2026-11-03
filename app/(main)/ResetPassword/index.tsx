import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Keyboard, Modal, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { PasswordRequirements } from '@/components/screens/ForgotPassword/PasswordRequirements';
import { ResetPasswordField } from '@/components/screens/Profile/ResetPasswordField';
import { BackButton } from '@/components/ui/BackButton';
import ModalBackdrop from '@/components/ui/Modals/ModalBackdrop';
import Pressable from '@/components/ui/Pressable';
import useAuth from '@/contexts/Auth/useAuth';
import { authService } from '@/services/auth';
import { getErrorMessage } from '@/utils/getErrorMessage';
import {
  ProfilePasswordForm,
  profilePasswordSchema,
} from '@/validation/ForgotPassword.validation';

const ResetPasswordScreen = () => {
  const [saved, setSaved] = useState(false);
  const { logout } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState(false);
  const closeSuccess = async () => {
    if (signingOut) {
      return;
    }
    setSigningOut(true);
    setLogoutError(false);
    try {
      await logout();
      router.replace('/(auth)/Login');
    } catch {
      setLogoutError(true);
    } finally {
      setSigningOut(false);
    }
  };
  const {
    control,
    handleSubmit,
    watch,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfilePasswordForm>({
    resolver: zodResolver(profilePasswordSchema),
    mode: 'onChange',
    defaultValues: { currentPassword: '', password: '', confirmPassword: '' },
  });
  const onSubmit = handleSubmit(async ({ currentPassword, password }) => {
    Keyboard.dismiss();
    setSaved(false);
    try {
      await authService.changePassword({
        currentPassword,
        newPassword: password,
      });
      reset();
      setSaved(true);
    } catch (error) {
      setError('root', {
        message: getErrorMessage(
          error,
          'Não foi possível alterar sua senha. Tente novamente.',
        ),
      });
    }
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

          <Text className="mb-4 mt-3 px-6 text-center font-poppins text-sm leading-5 text-[#70839D]">
            Atualize sua senha para manter sua conta segura. Crie uma senha
            forte, seguindo as orientações de segurança, e evite utilizar
            informações fáceis de descobrir.
          </Text>
        </View>

        <View className="gap-5">
          <ResetPasswordField
            control={control}
            label="Senha atual"
            name="currentPassword"
            placeholder="Digite sua senha atual"
          />

          <ResetPasswordField
            control={control}
            label="Nova senha"
            name="password"
            placeholder="Digite sua nova senha"
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
            accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }}
            className="min-h-10 items-center justify-center rounded-lg bg-[#0095B3] px-4 py-2 shadow-md"
            disabled={isSubmitting}
            onPress={onSubmit}
          >
            <Text className="font-poppins_semibold text-base text-white">
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Text>
          </Pressable>
        </View>
      </View>

      {saved && (
        <Modal transparent animationType="fade" onRequestClose={closeSuccess}>
          <ModalBackdrop
            showButton
            buttonLoading={signingOut}
            buttonText="Fechar"
            message="Senha alterada com sucesso. Entre novamente com sua nova senha para continuar."
            title="Sucesso !"
            variant="success"
            onClose={closeSuccess}
          >
            {logoutError && (
              <Text
                accessibilityRole="alert"
                className="mt-4 text-center font-poppins text-sm text-alert-error-primary"
              >
                Não foi possível encerrar a sessão. Toque em Fechar para tentar
                novamente.
              </Text>
            )}
          </ModalBackdrop>
        </Modal>
      )}
    </KeyboardAwareScrollView>
  );
};

export default ResetPasswordScreen;
