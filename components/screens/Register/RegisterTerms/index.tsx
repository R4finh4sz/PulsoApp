import { Control, useController, useWatch } from 'react-hook-form';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import ErrorText from '@/components/ui/ErrorText';
import { colors } from '@/global/colors';
import { RegistrationTerms } from '@/services/registration';
import {
  RegisterForm,
  requiresGuardian,
} from '@/validation/Register.validation';

type Props = {
  control: Control<RegisterForm>;
  terms?: RegistrationTerms;
  privacy?: RegistrationTerms;
  loading: boolean;
  error: boolean;
  retry: () => void;
  kind: 'terms' | 'privacy';
};
export const RegisterTerms = ({
  kind,
  control,
  terms,
  privacy,
  loading,
  error,
  retry,
}: Props) => {
  const { field, fieldState } = useController({
    control,
    name: 'termsAccepted',
  });
  const privacyControl = useController({ control, name: 'privacyAccepted' });
  const minor = requiresGuardian(useWatch({ control, name: 'birthDate' }));
  return (
    <View className="gap-6">
      {loading && (
        <ActivityIndicator
          accessibilityLabel="Carregando termos"
          color={colors.primary[100]}
        />
      )}

      {error && (
        <>
          <ErrorText text="Não foi possível carregar os termos. Tente novamente para continuar." />

          <Button wired text="Carregar termos novamente" onPress={retry} />
        </>
      )}

      {!loading &&
        !error &&
        terms &&
        privacy &&
        [
          kind === 'terms'
            ? {
                document: terms,
                field,
                fieldState,
                label: minor
                  ? 'Li e estou ciente do Termo do Estudante'
                  : 'Li e concordo com o termo',
              }
            : {
                document: privacy,
                ...privacyControl,
                label: minor
                  ? 'Li e aceito a Política de Privacidade'
                  : 'Li e concordo com a Política de Privacidade',
              },
        ].map(
          ({
            document,
            field: documentField,
            fieldState: documentState,
            label,
          }) => (
            <View key={label} className="gap-4">
              <ScrollView
                nestedScrollEnabled
                className="rounded-lg border border-[#d1d0d0]"
                contentContainerStyle={{ padding: 16 }}
                style={{ height: 310 }}
              >
                <Text className="mb-3 font-poppins_semibold text-base text-neutral-80">
                  {document.title}
                </Text>

                <Text className="font-poppins text-base leading-7 text-neutral-80">
                  {document.content}
                </Text>
              </ScrollView>

              <Text className="font-poppins text-xs text-neutral-80">
                Versão {document.version}
              </Text>

              <Checkbox
                checked={documentField.value}
                onToggle={documentField.onChange}
              >
                <Text className="font-poppins text-sm leading-6 text-primary-100">
                  {label}
                </Text>
              </Checkbox>

              <ErrorText text={documentState.error?.message} />
            </View>
          ),
        )}
    </View>
  );
};
