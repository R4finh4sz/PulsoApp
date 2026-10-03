import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Keyboard, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { PasswordRequirements } from '@/components/screens/ForgotPassword/PasswordRequirements';
import { ResetPasswordField } from '@/components/screens/Profile/ResetPasswordField';
import { BackButton } from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import { authService } from '@/services/auth';
import { isMockEnabled } from '@/services/mock';
import { getErrorMessage } from '@/utils/getErrorMessage';
import {
  ChangePasswordForm,
  changePasswordSchema,
} from '@/validation/ForgotPassword.validation';

const ResetPasswordScreen = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const {
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
    defaultValues: { password: '', confirmPassword: '' },
  });
  const onSubmit = handleSubmit(async values => {
    Keyboard.dismiss();
    if (!currentPassword) {
      setError('root', { message: 'Informe sua senha atual.' });
      return;
    }
    try {
      await authService.changePassword(currentPassword, values.password);
      Alert.alert(
        isMockEnabled ? 'Simulação concluída' : 'Senha alterada',
        isMockEnabled
          ? 'Nenhuma senha foi alterada no servidor.'
          : 'Sua senha foi atualizada com sucesso.',
      );
      router.replace('/(main)/Profile');
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

          <Text className="mt-3 px-6 text-center font-poppins text-sm leading-5 text-[#70839D]">
            Atualize sua senha para manter sua conta segura. Crie uma senha
            forte, seguindo as orientações de segurança, e evite utilizar
            informações fáceis de descobrir.
          </Text>
        </View>

        <View className="gap-5">
          <Text className="font-poppins text-sm text-neutral-80">
            Senha atual
          </Text>

          <TextInput
            secureTextEntry
            accessibilityLabel="Senha atual"
            autoCapitalize="none"
            autoComplete="current-password"
            autoCorrect={false}
            className="min-h-11 rounded-lg border border-neutral-20 bg-white px-3 font-poppins"
            placeholder="Digite sua senha atual"
            textContentType="password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />

          <ResetPasswordField
            control={control}
            label="Nova senha"
            name="password"
            placeholder="Digite sua senha"
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

          <Button
            withoutDelay
            disabled={isSubmitting}
            isLoading={isSubmitting}
            text="Salvar"
            onPress={onSubmit}
          />
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default ResetPasswordScreen;
