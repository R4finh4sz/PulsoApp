import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { ImagePickerAsset } from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FieldPath, useForm, useWatch } from 'react-hook-form';
import { BackHandler, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import StartRegister from '@/assets/images/StartRegister.svg';
import SuccessRegister from '@/assets/images/SucessImageRegister.svg';
import { RegisterAccess } from '@/components/screens/Register/RegisterAccess';
import { RegisterHeader } from '@/components/screens/Register/RegisterHeader';
import { RegisterPersonal } from '@/components/screens/Register/RegisterPersonal';
import { RegisterSchool } from '@/components/screens/Register/RegisterSchool';
import { RegisterTerms } from '@/components/screens/Register/RegisterTerms';
import { BackButton } from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import ModalBackdrop from '@/components/ui/Modals/ModalBackdrop';
import { useRegistrationLocation } from '@/hooks/useRegistrationLocation';
import { isMockEnabled } from '@/services/mock';
import { registrationService } from '@/services/registration';
import { useErrorModal } from '@/store/errorModalStore';
import {
  RegisterForm,
  RegisterSchema,
  requiresGuardian,
} from '@/validation/Register.validation';

const fields: FieldPath<RegisterForm>[][] = [
  [],
  ['name', 'birthDate', 'ra'],
  ['cep', 'city', 'state', 'schoolId'],
  ['email', 'password', 'confirmPassword', 'guardianName', 'guardianEmail'],
  ['termsAccepted'],
  ['privacyAccepted'],
];
const defaults: RegisterForm = {
  name: '',
  birthDate: '',
  ra: '',
  cep: '',
  city: '',
  state: '',
  schoolId: '',
  email: '',
  password: '',
  confirmPassword: '',
  termsAccepted: false,
  privacyAccepted: false,
  guardianName: '',
  guardianEmail: '',
};

const Register = () => {
  const [step, setStep] = useState(0);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [photo, setPhoto] = useState<ImagePickerAsset | null>(null);
  const submitting = useRef(false);
  const [busy, setBusy] = useState(false);
  const insets = useSafeAreaInsets();
  const form = useForm<RegisterForm>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: defaults,
  });
  const location = useRegistrationLocation(form);
  const birthDate = useWatch({ control: form.control, name: 'birthDate' });
  const minor = requiresGuardian(birthDate);
  const terms = useQuery({
    queryKey: ['registration-terms', isMockEnabled, minor],
    queryFn: () => registrationService.terms(birthDate),
    enabled: step >= 4,
    retry: false,
    staleTime: Infinity,
  });
  const privacy = useQuery({
    queryKey: ['registration-privacy', isMockEnabled],
    queryFn: registrationService.privacy,
    enabled: step >= 4,
    retry: false,
    staleTime: Infinity,
  });
  const termsLoading =
    (!terms.data || !privacy.data) && (terms.isFetching || privacy.isFetching);
  const termsFailed = (!terms.data || !privacy.data) && !termsLoading;
  useEffect(() => {
    form.setValue('termsAccepted', false);
    form.setValue('privacyAccepted', false);
  }, [terms.data?.version, privacy.data?.version, minor, form]);
  const goBack = useCallback(() => {
    if (submitting.current) {
      return;
    }
    if (step > 0 && step < 6) {
      setStep(value => value - 1);
    } else if (step === 0) {
      setShowExitWarning(true);
    } else {
      router.replace('/(auth)/Login');
    }
  }, [step]);
  useFocusEffect(
    useCallback(() => {
      const listener = BackHandler.addEventListener('hardwareBackPress', () => {
        goBack();
        return true;
      });
      return () => listener.remove();
    }, [goBack]),
  );

  const next = async () => {
    if (submitting.current) {
      return;
    }
    if (step === 6) {
      router.replace('/(auth)/Login');
      return;
    }
    if (step < 5) {
      submitting.current = true;
      try {
        if (step > 0 && !(await form.trigger(fields[step]))) {
          return;
        }
        if (
          step === 2 &&
          (!location.ready ||
            !location.schools.some(
              school => school.id === form.getValues('schoolId'),
            ))
        ) {
          return;
        }
        setStep(step + 1);
      } finally {
        submitting.current = false;
      }
      return;
    }
    if (
      !terms.data?.version ||
      !terms.data.content ||
      !privacy.data?.version ||
      !privacy.data.content
    ) {
      return;
    }
    submitting.current = true;
    setBusy(true);
    try {
      await form.handleSubmit(
        async values => {
          if (
            !location.ready ||
            !location.schools.some(school => school.id === values.schoolId)
          ) {
            setStep(2);
            return;
          }
          await registrationService.submit(
            values,
            terms.data.version,
            photo,
            privacy.data!.version,
          );
          setPhoto(null);
          form.reset(defaults);
          setStep(6);
        },
        errors => {
          const invalidStep = fields.findIndex(names =>
            names.some(name => errors[name]),
          );
          if (invalidStep > 0) {
            setStep(invalidStep);
          }
        },
      )();
    } catch (error) {
      useErrorModal.getState().openErrorFromException(error, {
        message: 'Não foi possível enviar seu cadastro. Tente novamente.',
      });
      form.setValue('termsAccepted', false);
      form.setValue('privacyAccepted', false);
      await Promise.all([terms.refetch(), privacy.refetch()]);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };

  return (
    <>
      <KeyboardAwareScrollView
        key={step}
        className="flex-1 bg-[#FCFCFC]"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 10,
          paddingBottom: Math.max(insets.bottom, 16) + 12,
          paddingHorizontal: 20,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mx-auto w-full max-w-lg flex-1">
          {step < 6 && (
            <View className="mb-2 flex-row items-center justify-between">
              <BackButton onPress={goBack} />

              {step > 0 && (
                <Text
                  accessibilityLabel={`Etapa ${step} de 5`}
                  className="font-poppins text-xs text-neutral-60"
                >
                  {step} de 5
                </Text>
              )}
            </View>
          )}

          <RegisterHeader mock={isMockEnabled} step={step} />

          {step === 0 && (
            <View className="min-h-80 flex-1 justify-center py-6">
              <StartRegister height={340} width="100%" />
            </View>
          )}

          {step === 1 && <RegisterPersonal control={form.control} />}

          {step === 2 && <RegisterSchool form={form} location={location} />}

          {step === 3 && (
            <RegisterAccess
              control={form.control}
              photo={photo}
              onPhotoChange={setPhoto}
            />
          )}

          {(step === 4 || step === 5) && (
            <RegisterTerms
              control={form.control}
              error={termsFailed}
              kind={step === 4 ? 'terms' : 'privacy'}
              loading={termsLoading}
              privacy={privacy.data}
              retry={() => {
                form.setValue('termsAccepted', false);
                form.setValue('privacyAccepted', false);
                terms.refetch();
                privacy.refetch();
              }}
              terms={terms.data}
            />
          )}

          {step === 6 && (
            <View className="min-h-80 flex-1 justify-center py-6">
              <SuccessRegister height={340} width="100%" />
            </View>
          )}

          <View className="min-h-8 flex-1" />

          <View className="gap-3 pt-6">
            <Button
              withoutDelay
              withShadow
              className="min-h-12"
              disabled={
                (step === 2 && (!location.ready || !location.schools.length)) ||
                ((step === 4 || step === 5) &&
                  (!terms.data?.content ||
                    !terms.data.version ||
                    !privacy.data?.content ||
                    !privacy.data.version ||
                    terms.isFetching ||
                    privacy.isFetching))
              }
              isLoading={busy}
              text={step === 6 ? 'Voltar ao login' : 'Continuar'}
              onPress={next}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>

      {showExitWarning && (
        <ModalBackdrop
          buttons={[
            {
              text: 'Continuar',
              onPress: () => setShowExitWarning(false),
            },
            {
              text: 'Sair',
              wired: true,
              onPress: () => {
                setShowExitWarning(false);
                router.replace('/(auth)/Login');
              },
            },
          ]}
          message="Tem certeza que vai perder todo seu progresso ?"
          title="Sair do cadastro?"
          variant="warning"
          onClose={() => setShowExitWarning(false)}
        />
      )}
    </>
  );
};
export default Register;
