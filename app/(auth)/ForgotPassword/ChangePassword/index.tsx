import { zodResolver } from '@hookform/resolvers/zod';
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
  const [showUnavailable, setShowUnavailable] = useState(false);
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
    setShowUnavailable(true);
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
    >
      <View className="w-full flex-1 self-center px-[18px]">
        <BackButton />

        <ChangePasswordIntro />

        <ChangePasswordFields
          control={control}
          onSubmit={handleSubmit(onSubmit)}
        />

        <ChangePasswordAction
          disabled={!isValid || showUnavailable}
          onSubmit={handleSubmit(onSubmit)}
        />
      </View>

      {showUnavailable && (
        <ModalBackdrop
          showButton
          visible
          buttonText="Entendi"
          message="A alteração de senha está indisponível no momento. Tente novamente mais tarde."
          title="Não foi possível salvar"
          variant="error"
          onClose={() => setShowUnavailable(false)}
        />
      )}
    </KeyboardAwareScrollView>
  );
};

export default ChangePasswordScreen;
