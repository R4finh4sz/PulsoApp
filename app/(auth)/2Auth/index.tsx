import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import twoAuthImage from '@/assets/images/2Auth.png';
import { TwoAuthAction } from '@/components/screens/2Auth/TwoAuthAction';
import { TwoAuthFields } from '@/components/screens/2Auth/TwoAuthFields';
import { TwoAuthIntro } from '@/components/screens/2Auth/TwoAuthIntro';
import { TwoAuthResend } from '@/components/screens/2Auth/TwoAuthResend';
import Image from '@/components/ui/Image';
import { useAuth } from '@/contexts/Auth/useAuth';
import { useErrorModal } from '@/store/errorModalStore';
import { useOTPStore } from '@/store/otpStore';

const TwoFactorAuth = () => {
  const { completeLogin, resendOTPCode } = useAuth();
  const { otpData } = useOTPStore();
  const { openErrorFromException } = useErrorModal();
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);
  if (!otpData) {
    return <Redirect href="/(auth)/Login" />;
  }
  const resendSeconds = Math.max(
    0,
    Math.ceil((Date.parse(otpData.resendAvailableAt) - now) / 1000),
  );
  const expired = now >= Date.parse(otpData.codeExpiresAt);
  const handleResend = async () => {
    if (isResending || isSubmitting || resendSeconds > 0) {
      return;
    }
    setIsResending(true);
    try {
      await resendOTPCode();
      setCode('');
    } catch (error) {
      openErrorFromException(error, { title: 'Não foi possível reenviar' });
    } finally {
      setIsResending(false);
    }
  };
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

        <Text className="mt-4 text-center font-poppins text-sm text-[#616161]">
          {expired
            ? 'Código expirado. Solicite um novo código.'
            : `Enviado para ${otpData.email}`}
        </Text>

        <TwoAuthResend
          disabled={isResending || isSubmitting || resendSeconds > 0}
          onResend={handleResend}
        />

        {resendSeconds > 0 && (
          <Text className="text-center font-poppins text-sm">
            Reenvio disponível em {resendSeconds}s
          </Text>
        )}
      </View>

      <TwoAuthAction
        disabled={!isCodeComplete || isSubmitting || isResending}
        isLoading={isSubmitting}
        onSubmit={handleConfirm}
      />
    </KeyboardAwareScrollView>
  );
};

export default TwoFactorAuth;
