import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Keyboard, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChangePasswordAction } from '@/components/screens/ForgotPassword/ChangePasswordAction';
import { ChangePasswordFields } from '@/components/screens/ForgotPassword/ChangePasswordFields';
import { ChangePasswordIntro } from '@/components/screens/ForgotPassword/ChangePasswordIntro';
import { BackButton } from '@/components/ui/BackButton';
import ModalBackdrop from '@/components/ui/Modals/ModalBackdrop';
import { passwordRecoveryService } from '@/services/passwordRecovery';
import { useErrorModal } from '@/store/errorModalStore';
import { usePasswordRecoveryStore } from '@/store/passwordRecoveryStore';
import {
  ChangePasswordForm,
  changePasswordSchema,
} from '@/validation/ForgotPassword.validation';

const ChangePasswordScreen = () => {
  const insets = useSafeAreaInsets();
  const [showSuccess, setShowSuccess] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
    defaultValues: { password: '', confirmPassword: '' },
  });

  const recovery = usePasswordRecoveryStore(state => state.recovery);
  const reset = useMutation({
    gcTime: 0,
    retry: false,
    mutationFn: async ({ password, confirmPassword }: ChangePasswordForm) => {
      if (
        !recovery?.resetToken ||
        !recovery.expiresAt ||
        Date.now() >= Date.parse(recovery.expiresAt)
      ) {
        throw new Error('Solicite um novo código para redefinir sua senha.');
      }
      await passwordRecoveryService.reset({
        email: recovery.email,
        resetToken: recovery.resetToken,
        newPassword: password,
        confirmPassword,
      });
    },
    onSuccess: () => {
      usePasswordRecoveryStore.getState().setRecovery(null);
      setShowSuccess(true);
    },
    onError: error => useErrorModal.getState().openErrorFromException(error),
  });
  if (!recovery?.resetToken && !showSuccess) {
    return <Redirect href="/(auth)/ForgotPassword/EmailScreen" />;
  }
  const onSubmit = (values: ChangePasswordForm) => {
    Keyboard.dismiss();
    if (!reset.isPending) {
      reset.mutate(values);
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingHorizontal: 6,
        backgroundColor: '#F5F5F5',
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View className="w-full flex-1 self-center px-[18px]">
        <BackButton />

        <ChangePasswordIntro />

        <ChangePasswordFields
          control={control}
          onSubmit={handleSubmit(onSubmit)}
        />

        <ChangePasswordAction
          disabled={!isValid || reset.isPending || showSuccess}
          isLoading={reset.isPending}
          onSubmit={handleSubmit(onSubmit)}
        />
      </View>

      {showSuccess && (
        <ModalBackdrop
          showButton
          visible
          buttonText="Voltar ao login"
          message="Sua senha foi alterada com sucesso. Entre com sua nova senha."
          title="Sucesso!"
          variant="success"
          onClose={() => router.dismissTo('/(auth)/Login')}
        />
      )}
    </KeyboardAwareScrollView>
  );
};

export default ChangePasswordScreen;
