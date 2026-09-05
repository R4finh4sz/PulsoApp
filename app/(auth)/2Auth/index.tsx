import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/Auth/useAuth';
import { height, width } from '@/global/constants';
import colors from '@/global/colors';
import { useOTPStore } from '@/store/otpStore';

const TwoFactorAuth = () => {
  const { completeLogin, resendOTPCode } = useAuth();
  const { otpData } = useOTPStore();
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!otpData) {
      router.replace('/(auth)/Login');
    }
  }, [otpData]);

  const handleConfirm = async () => {
    if (!otpData || code.trim().length < 6) {
      return;
    }

    setIsSubmitting(true);
    try {
      await completeLogin({ ...otpData, code: code.trim() });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (otpData) {
      await resendOTPCode(otpData);
    }
  };

  if (!otpData) {
    return null;
  }

  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View
        className="items-center justify-center gap-5 p-6"
        style={{ minHeight: height, width }}
      >
        <View className="w-full gap-2">
          <Text className="text-2xl text-primary-100">Verifique seu acesso</Text>
          <Text className="text-base text-neutral-60">
            Enviamos um codigo para {otpData.email}.
          </Text>
        </View>

        <View className="w-full gap-2">
          <Text className="text-base text-primary-100">Codigo de verificacao</Text>
          <TextInput
            autoFocus
            keyboardType="number-pad"
            maxLength={6}
            placeholder="000000"
            placeholderTextColor={colors.neutral[40]}
            value={code}
            onChangeText={setCode}
            style={{
              borderColor: colors.neutral[20],
              borderRadius: 12,
              borderWidth: 1,
              color: colors.neutral[60],
              fontSize: 20,
              letterSpacing: 8,
              padding: 16,
              textAlign: 'center',
            }}
          />
        </View>

        <Button
          isLoading={isSubmitting}
          text="CONFIRMAR"
          disabled={code.trim().length < 6}
          onPress={handleConfirm}
        />
        <Button text="REENVIAR CODIGO" wired onPress={handleResend} />
      </View>
    </KeyboardAwareScrollView>
  );
};

export default TwoFactorAuth;
