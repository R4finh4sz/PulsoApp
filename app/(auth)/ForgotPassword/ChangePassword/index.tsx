import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
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

  const onSubmit = () => {
    Keyboard.dismiss();
    setShowSuccess(true);
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
          disabled={!isValid || showSuccess}
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
