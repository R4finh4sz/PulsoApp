import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Keyboard, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmailAction } from '@/components/screens/ForgotPassword/EmailAction';
import {
  EmailFields,
  RecoveryEmailForm,
} from '@/components/screens/ForgotPassword/EmailFields';
import { EmailHeader } from '@/components/screens/ForgotPassword/EmailHeader';
import { EmailIntro } from '@/components/screens/ForgotPassword/EmailIntro';
import ModalBackdrop from '@/components/ui/Modals/ModalBackdrop';
import { recoveryEmailSchema } from '@/validation/ForgotPassword.validation';

const EmailScreen = () => {
  const insets = useSafeAreaInsets();
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<RecoveryEmailForm>({
    resolver: zodResolver(recoveryEmailSchema),
    mode: 'onChange',
    defaultValues: { email: '' },
  });

  const onSubmit = ({ email }: RecoveryEmailForm) => {
    Keyboard.dismiss();
    setSubmittedEmail(email.trim());
  };

  const handleContinue = () => {
    if (submittedEmail === null) {
      return;
    }
    const email = submittedEmail;
    setSubmittedEmail(null);
    router.push(
      { pathname: '../2authScreen', params: { email } },
      { relativeToDirectory: true },
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <KeyboardAwareScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 52,
          paddingBottom: insets.bottom,
          paddingHorizontal: 18,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{ flex: 1, width: '100%', maxWidth: 440, alignSelf: 'center' }}
        >
          <EmailHeader />

          <EmailIntro />

          <EmailFields control={control} onSubmit={handleSubmit(onSubmit)} />

          <EmailAction
            disabled={!isValid || submittedEmail !== null}
            onSubmit={handleSubmit(onSubmit)}
          />
        </View>
      </KeyboardAwareScrollView>

      {submittedEmail !== null && (
        <ModalBackdrop
          showButton
          visible
          buttonText="Continuar"
          message="Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha."
          title="Sucesso!"
          variant="success"
          onClose={handleContinue}
        />
      )}
    </View>
  );
};

export default EmailScreen;
