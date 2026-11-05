import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Keyboard, Modal, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DeletionRequests } from '@/components/screens/Profile/DeletionRequests';
import { ResetPasswordField } from '@/components/screens/Profile/ResetPasswordField';
import { BackButton } from '@/components/ui/BackButton';
import ModalBackdrop from '@/components/ui/Modals/ModalBackdrop';
import Pressable from '@/components/ui/Pressable';
import { profileService } from '@/services/profile';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { ProfilePasswordForm } from '@/validation/ForgotPassword.validation';

const RequestDeletedAccount = () => {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');
  const [showRequests, setShowRequests] = useState(true);
  const [reasonError, setReasonError] = useState(false);
  const [passwordStep, setPasswordStep] = useState(false);
  const [result, setResult] = useState<{
    error: boolean;
    message: string;
  } | null>(null);
  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { isSubmitting },
  } = useForm<ProfilePasswordForm>({ defaultValues: { currentPassword: '' } });
  const back = () => {
    if (isSubmitting) {
      return;
    }
    if (passwordStep) {
      reset();
      setPasswordStep(false);
    } else {
      setShowRequests(true);
    }
  };
  const submit = handleSubmit(async ({ currentPassword }) => {
    if (isSubmitting) {
      return;
    }
    if (!currentPassword) {
      setError('currentPassword', { message: 'Digite sua senha atual.' });
      return;
    }
    Keyboard.dismiss();
    try {
      await profileService.requestDeletion({
        reason: reason.trim(),
        currentPassword,
      });
      reset();
      await queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      await queryClient.invalidateQueries({ queryKey: ['deletion-requests'] });
      setResult({
        error: false,
        message: 'Sua solicitação de exclusão de conta foi enviada.',
      });
    } catch (error) {
      reset();
      setResult({
        error: true,
        message: getErrorMessage(
          error,
          'Não foi possível enviar a solicitação. Tente novamente.',
        ),
      });
    }
  });
  const next = () => {
    if (!reason.trim()) {
      setReasonError(true);
      return;
    }
    setReasonError(false);
    Keyboard.dismiss();
    setPasswordStep(true);
  };
  const actionLabel = passwordStep ? 'Finalizar pedido' : 'Prosseguir';

  if (showRequests) {
    return (
      <DeletionRequests
        onBack={() =>
          router.canGoBack() ? router.back() : router.replace('/(main)/Profile')
        }
        onNew={() => setShowRequests(false)}
      />
    );
  }

  return (
    <>
      <KeyboardAwareScrollView
        className="flex-1 bg-neutral-background"
        contentContainerClassName="grow px-6"
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 40,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full max-w-[560px] flex-1 self-center">
          <BackButton onPress={back} />

          <View className="mt-10 h-[72px] w-[72px] items-center justify-center self-center rounded-3xl bg-[#FFA7A7]">
            <ShieldCheck color="#FF4141" size={34} strokeWidth={1.7} />
          </View>

          <Text
            accessibilityRole="header"
            className="mt-4 text-center font-poppins_bold text-xl leading-7 text-[#253044]"
          >
            Solicitar exclusão{'\n'}de conta
          </Text>

          <Text className="mt-3 text-center font-poppins text-sm leading-5 text-[#70839D]">
            {passwordStep
              ? 'Para confirmar sua solicitação de exclusão da conta, digite sua senha atual.'
              : 'Solicite a exclusão da sua conta caso não queira mais utilizar a plataforma. Após a exclusão, essa ação não poderá ser desfeita.'}
          </Text>

          <View className="mt-6">
            {passwordStep ? (
              <ResetPasswordField
                control={control}
                label="Senha"
                name="currentPassword"
                placeholder="Digite sua senha"
                onSubmit={submit}
              />
            ) : (
              <View className="gap-2">
                <Text className="font-poppins text-sm text-neutral-80">
                  Motivo
                </Text>

                <TextInput
                  multiline
                  accessibilityLabel="Motivo"
                  className="min-h-[240px] rounded-2xl border border-neutral-20 bg-white px-3 py-3 font-poppins text-sm text-neutral-80"
                  placeholder="Digite o motivo para exclusão da conta"
                  placeholderTextColor="#737373"
                  textAlignVertical="top"
                  value={reason}
                  onChangeText={setReason}
                />

                {reasonError && (
                  <Text
                    accessibilityRole="alert"
                    className="font-poppins text-xs text-alert-error-primary"
                  >
                    Informe o motivo da exclusão.
                  </Text>
                )}
              </View>
            )}
          </View>

          <View className="min-h-20 flex-1" />

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }}
            className="min-h-11 items-center justify-center rounded-lg bg-[#0095B3] px-4 py-2"
            disabled={isSubmitting}
            onPress={passwordStep ? submit : next}
          >
            <Text className="font-poppins_semibold text-base text-white">
              {isSubmitting ? 'Enviando...' : actionLabel}
            </Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>

      <Modal
        transparent
        animationType="fade"
        visible={!!result}
        onRequestClose={() => setResult(null)}
      >
        {result && (
          <ModalBackdrop
            showButton
            buttonText="Entendi"
            message={result.message}
            title={
              result.error
                ? 'Não foi possível solicitar a exclusão'
                : 'Solicitação enviada'
            }
            variant={result.error ? 'error' : 'success'}
            onClose={() => {
              setResult(null);
              if (!result.error) {
                setReason('');
                setPasswordStep(false);
                setShowRequests(true);
              }
            }}
          />
        )}
      </Modal>
    </>
  );
};

export default RequestDeletedAccount;
