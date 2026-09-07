import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Keyboard, Text, View } from 'react-native';
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

const CODE_DURATION_MS = 5 * 60 * 1000;

const RecoveryCodeScreen = () => {
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState('');
  const [hasResent, setHasResent] = useState(false);
  const [showResendSuccess, setShowResendSuccess] = useState(false);
  const [expiresAt, setExpiresAt] = useState(
    () => Date.now() + CODE_DURATION_MS,
  );
  const [secondsRemaining, setSecondsRemaining] = useState(300);
  const isCodeComplete = /^\d{6}$/.test(code);
  const isExpired = secondsRemaining === 0;
  const isResendDisabled = hasResent && !isExpired;
  const remainingTime = `${Math.floor(secondsRemaining / 60)
    .toString()
    .padStart(2, '0')}:${(secondsRemaining % 60).toString().padStart(2, '0')}`;

  useEffect(() => {
    const updateRemainingTime = () => {
      setSecondsRemaining(
        Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)),
      );
    };
    updateRemainingTime();
    const interval = setInterval(updateRemainingTime, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleResend = () => {
    if (hasResent && Date.now() < expiresAt) {
      return;
    }
    Keyboard.dismiss();
    setCode('');
    setSecondsRemaining(300);
    setExpiresAt(Date.now() + CODE_DURATION_MS);
    setHasResent(true);
    setShowResendSuccess(true);
  };

  const handleConfirm = () => {
    if (!isCodeComplete || Date.now() >= expiresAt) {
      return;
    }
    Keyboard.dismiss();
    router.push('/(auth)/ForgotPassword/ChangePassword');
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

          <TwoAuthFields editable code={code} onChangeCode={setCode} />

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

          <TwoAuthResend disabled={isResendDisabled} onResend={handleResend} />

          <Button
            color="#0095B3"
            disabled={!isCodeComplete || isExpired}
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
