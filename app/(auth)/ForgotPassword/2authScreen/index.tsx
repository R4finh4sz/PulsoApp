import { useMutation } from '@tanstack/react-query';
import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Keyboard, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import twoAuthImage from '@/assets/images/2Auth.png';
import { TwoAuthFields } from '@/components/screens/2Auth/TwoAuthFields';
import { TwoAuthIntro } from '@/components/screens/2Auth/TwoAuthIntro';
import { TwoAuthResend } from '@/components/screens/2Auth/TwoAuthResend';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import Image from '@/components/ui/Image';
import ModalBackdrop from '@/components/ui/Modals/ModalBackdrop';
import { passwordRecoveryService } from '@/services/passwordRecovery';
import { useErrorModal } from '@/store/errorModalStore';
import { usePasswordRecoveryStore } from '@/store/passwordRecoveryStore';

const RecoveryCodeScreen = () => {
  const insets = useSafeAreaInsets();
  const recovery = usePasswordRecoveryStore(state => state.recovery);
  const [code, setCode] = useState('');
  const [showResendSuccess, setShowResendSuccess] = useState(false);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);
  const resend = useMutation({
    gcTime: 0,
    retry: false,
    mutationFn: () => passwordRecoveryService.request(recovery!.email),
    onSuccess: () => {
      usePasswordRecoveryStore
        .getState()
        .setRecovery({ email: recovery!.email, requestedAt: Date.now() });
      setNow(Date.now());
      setCode('');
      setShowResendSuccess(true);
    },
    onError: error => useErrorModal.getState().openErrorFromException(error),
  });
  const verify = useMutation({
    gcTime: 0,
    retry: false,
    mutationFn: () => passwordRecoveryService.verify(recovery!.email, code),
    onSuccess: data => {
      usePasswordRecoveryStore
        .getState()
        .setRecovery({ ...recovery!, ...data });
      router.push('/(auth)/ForgotPassword/ChangePassword');
    },
    onError: error => useErrorModal.getState().openErrorFromException(error),
  });
  if (!recovery) {
    return <Redirect href="/(auth)/ForgotPassword/EmailScreen" />;
  }
  const expiresAt = recovery.requestedAt + 600000;
  const secondsRemaining = Math.max(0, Math.ceil((expiresAt - now) / 1000));
  const resendSeconds = Math.max(
    0,
    Math.ceil((recovery.requestedAt + 180000 - now) / 1000),
  );
  const isCodeComplete = /^\d{6}$/.test(code);
  const isExpired = secondsRemaining === 0;
  const busy = resend.isPending || verify.isPending;
  const isResendDisabled = busy || resendSeconds > 0;
  const remainingTime = `${Math.floor(secondsRemaining / 60)
    .toString()
    .padStart(2, '0')}:${(secondsRemaining % 60).toString().padStart(2, '0')}`;
  const handleResend = () => {
    if (isResendDisabled) {
      return;
    }
    Keyboard.dismiss();
    resend.mutate();
  };
  const handleConfirm = () => {
    if (!isCodeComplete || busy || Date.now() >= expiresAt) {
      return;
    }
    Keyboard.dismiss();
    verify.mutate();
  };

  return (
    <View className="flex-1 bg-[#F5F5F5]">
      <KeyboardAwareScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 48,
          paddingBottom: Math.max(insets.bottom, 20),
          paddingHorizontal: 24,
        }}
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1, backgroundColor: '#F5F5F5' }}
      >
        <View
          style={{ flex: 1, width: '100%', maxWidth: 350, alignSelf: 'center' }}
        >
          <Image
            contentFit="contain"
            source={twoAuthImage}
            style={{
              width: '100%',
              maxWidth: 220,
              height: 190,
              alignSelf: 'center',
            }}
          />

          <TwoAuthIntro marginTop={8} />

          <TwoAuthFields code={code} editable={!busy} onChangeCode={setCode} />

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              marginTop: 12,
            }}
          >
            <Icon color="#616161" name="Clock" size={21} />

            <Text className="font-poppins text-sm text-[#616161]">
              {isExpired ? 'Código expirado' : 'Código expira em'}
            </Text>

            <Text className="font-poppins_bold text-sm text-[#009BB9]">
              {remainingTime}
            </Text>
          </View>

          {resend.isPending && (
            <ActivityIndicator
              accessibilityLabel="Reenviando código"
              color="#0095B3"
            />
          )}

          {resendSeconds > 0 && (
            <Text className="text-center">Reenviar em {resendSeconds}s</Text>
          )}

          <TwoAuthResend disabled={isResendDisabled} onResend={handleResend} />

          <Button
            color="#0095B3"
            disabled={!isCodeComplete || isExpired || busy}
            isLoading={verify.isPending}
            text="Confirmar"
            textClassName="font-poppins_bold text-base"
            onPress={handleConfirm}
          />
        </View>
      </KeyboardAwareScrollView>

      {showResendSuccess && (
        <ModalBackdrop
          showButton
          visible
          buttonText="Continuar"
          message="Se o e-mail estiver cadastrado, você receberá um novo código de verificação."
          title="Sucesso!"
          variant="success"
          onClose={() => setShowResendSuccess(false)}
        />
      )}
    </View>
  );
};

export default RecoveryCodeScreen;
