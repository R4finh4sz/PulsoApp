import { router } from 'expo-router';
import { CircleCheck, LockKeyhole } from 'lucide-react-native';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Keyboard, Modal, ScrollView, Text, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ResetPasswordField } from '@/components/screens/Profile/ResetPasswordField';
import { BackButton } from '@/components/ui/BackButton';
import Image from '@/components/ui/Image';
import ModalBackdrop from '@/components/ui/Modals/ModalBackdrop';
import Pressable from '@/components/ui/Pressable';
import useAuth from '@/contexts/Auth/useAuth';
import { shadow } from '@/global/shadow';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { ProfilePasswordForm } from '@/validation/ForgotPassword.validation';

const SecurityScreen = () => {
  const insets = useSafeAreaInsets();
  const { twoFactorRequired, updateTwoFactor } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const {
    control,
    reset,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = useForm<ProfilePasswordForm>({
    defaultValues: { currentPassword: '' },
  });
  const closeConfirmation = () => {
    if (isSubmitting) {
      return;
    }
    Keyboard.dismiss();
    setConfirming(false);
    setRequestError(null);
    reset();
  };
  const confirm = handleSubmit(async ({ currentPassword }) => {
    if (twoFactorRequired === null || isSubmitting) {
      return;
    }
    if (!currentPassword) {
      setError('currentPassword', { message: 'Digite sua senha atual.' });
      return;
    }
    try {
      await updateTwoFactor(!twoFactorRequired, currentPassword);
      Keyboard.dismiss();
      setConfirming(false);
      reset();
    } catch (error) {
      Keyboard.dismiss();
      reset();
      setRequestError(
        getErrorMessage(
          error,
          'Não foi possível atualizar a autenticação de dois fatores. Tente novamente.',
        ),
      );
    }
  });

  return (
    <ScrollView
      className="flex-1 bg-neutral-background"
      contentContainerClassName="grow px-6"
      contentContainerStyle={{
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 32,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View className="w-full max-w-[560px] self-center">
        <BackButton
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.replace('/(main)/Profile')
          }
        />

        <Text
          accessibilityRole="header"
          className="mt-9 text-center font-poppins_bold text-xl leading-7 text-[#253044]"
        >
          Autenticação de{'\n'}dois fatores
        </Text>

        <Text className="mt-3 px-3 text-center font-poppins text-sm leading-5 text-[#70839D]">
          Ative a autenticação de dois fatores para adicionar uma camada extra
          de segurança à sua conta. Após a ativação, será necessário confirmar
          sua identidade com um segundo método de verificação ao realizar o
          login, protegendo sua conta contra acessos não autorizados.
        </Text>

        <View
          className="mt-9 flex-row items-center gap-3 rounded-[14px] bg-neutral-background px-4 py-3"
          style={shadow.default}
        >
          <LockKeyhole color="#253044" size={23} strokeWidth={1.7} />

          <Text className="flex-1 font-poppins_medium text-[13px] text-[#253044]">
            Autenticação de 2 fatores
          </Text>

          <Pressable
            accessibilityLabel="Autenticação de 2 fatores"
            accessibilityRole="switch"
            accessibilityState={{
              checked: twoFactorRequired === true,
              disabled: twoFactorRequired === null,
            }}
            className="min-h-11 min-w-11 items-center justify-center"
            disabled={twoFactorRequired === null}
            onPress={() => setConfirming(true)}
          >
            <View
              className={`h-6 w-11 justify-center rounded-full px-0.5 ${twoFactorRequired ? 'bg-[#0095B3]' : 'bg-[#BFC5CB]'}`}
            >
              <View
                className={`h-5 w-5 rounded-full bg-white ${twoFactorRequired ? 'self-end' : 'self-start'}`}
              />
            </View>
          </Pressable>
        </View>

        {twoFactorRequired === null && (
          <Text className="mt-3 text-center font-poppins text-xs leading-5 text-[#70839D]">
            Entre novamente para carregar sua configuração de dois fatores.
          </Text>
        )}

        <Image
          accessibilityLabel="Ilustração de proteção de dados e segurança digital"
          contentFit="contain"
          // eslint-disable-next-line global-require, @typescript-eslint/no-require-imports
          source={require('@/assets/images/SecurityImage.png')}
          style={{ width: '100%', aspectRatio: 1, marginTop: 40 }}
        />
      </View>

      <Modal
        transparent
        animationType="fade"
        visible={confirming}
        onRequestClose={closeConfirmation}
      >
        {requestError ? (
          <ModalBackdrop
            showButton
            buttonText="Entendi"
            message={requestError}
            title="Não foi possível alterar a autenticação"
            variant="error"
            onClose={closeConfirmation}
          />
        ) : (
          <KeyboardAvoidingView behavior="padding" className="flex-1">
            <ScrollView
              contentContainerClassName="grow justify-center bg-black/70 px-5 py-8"
              keyboardShouldPersistTaps="handled"
            >
              <View
                accessibilityViewIsModal
                className="w-full max-w-[560px] self-center rounded-[24px] bg-white px-5 py-8"
              >
                <View className="mb-6 h-16 w-16 items-center justify-center self-center rounded-full bg-[#ABE0B3]">
                  <CircleCheck color="#5B893E" size={32} strokeWidth={2} />
                </View>

                <Text
                  accessibilityRole="header"
                  className="mb-8 text-center font-poppins_semibold text-2xl leading-9 text-[#202124]"
                >
                  Digite sua senha para concluir a operação
                </Text>

                <ResetPasswordField
                  control={control}
                  label="Senha"
                  name="currentPassword"
                  placeholder="Digite sua senha"
                  onSubmit={confirm}
                />

                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{
                    disabled: isSubmitting,
                    busy: isSubmitting,
                  }}
                  className="mt-6 min-h-[52px] items-center justify-center rounded-xl bg-[#0095B3] px-4 py-3"
                  disabled={isSubmitting}
                  onPress={confirm}
                >
                  <Text className="font-poppins text-lg text-white">
                    {isSubmitting ? 'Salvando...' : 'Concluir'}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </Modal>
    </ScrollView>
  );
};

export default SecurityScreen;
