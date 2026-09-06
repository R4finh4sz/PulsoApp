import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import twoAuthImage from '@/assets/images/2Auth.png';
import { TwoAuthAction } from '@/components/screens/2Auth/TwoAuthAction';
import { TwoAuthFields } from '@/components/screens/2Auth/TwoAuthFields';
import { TwoAuthIntro } from '@/components/screens/2Auth/TwoAuthIntro';
import Image from '@/components/ui/Image';
import { useAuth } from '@/contexts/Auth/useAuth';
import { useErrorModal } from '@/store/errorModalStore';
import { useOTPStore } from '@/store/otpStore';

const TwoFactorAuth = () => {
  const { completeLogin } = useAuth();
  const { otpData } = useOTPStore();
  const { openErrorFromException } = useErrorModal();
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isCodeComplete = /^\d{6}$/.test(code);

  const handleConfirm = async () => {
    if (!isCodeComplete || isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    try {
      if (!otpData) {
        throw new Error(
          'Não foi possível encontrar a solicitação de verificação.',
        );
      }
      await completeLogin({ ...otpData, code });
      router.replace('/(main)/Home');
    } catch (error) {
      openErrorFromException(error, {
        title: 'Não foi possível confirmar',
        message: 'Verifique seu código e tente novamente.',
        buttonText: 'Tentar novamente',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{
        paddingTop: insets.top + 48,
        paddingBottom: insets.bottom,
        paddingHorizontal: 24,
      }}
      keyboardShouldPersistTaps="handled"
      style={{ flex: 1, backgroundColor: '#F5F5F5' }}
    >
      <View style={{ width: '100%', maxWidth: 500, alignSelf: 'center' }}>
        <Image
          contentFit="contain"
          source={twoAuthImage}
          style={{ width: 310, height: 200 }}
        />

        <TwoAuthIntro />

        <TwoAuthFields
          code={code}
          editable={!isSubmitting}
          onChangeCode={setCode}
        />
      </View>

      <TwoAuthAction
        disabled={!isCodeComplete || isSubmitting}
        isLoading={isSubmitting}
        onSubmit={handleConfirm}
      />
    </KeyboardAwareScrollView>
  );
};

export default TwoFactorAuth;
