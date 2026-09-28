import { Control, useController } from 'react-hook-form';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import ErrorText from '@/components/ui/ErrorText';
import { colors } from '@/global/colors';
import { RegistrationTerms } from '@/services/registration';
import { RegisterForm } from '@/validation/Register.validation';

type Props = {
  control: Control<RegisterForm>;
  terms?: RegistrationTerms;
  loading: boolean;
  error: boolean;
  retry: () => void;
};
export const RegisterTerms = ({
  control,
  terms,
  loading,
  error,
  retry,
}: Props) => {
  const { field, fieldState } = useController({
    control,
    name: 'termsAccepted',
  });
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

      {terms && (
        <>
          <ScrollView
            nestedScrollEnabled
            className="rounded-lg border border-[#d1d0d0]"
            contentContainerStyle={{ padding: 16 }}
            style={{ height: 310 }}
          >
            <Text className="mb-3 font-poppins_semibold text-base text-neutral-80">
              {terms.title}
            </Text>

            <Text className="font-poppins text-base leading-7 text-neutral-80">
              {terms.content}
            </Text>
          </ScrollView>

          <Checkbox checked={field.value} onToggle={field.onChange}>
            <Text className="font-poppins text-sm leading-6 text-primary-100">
              Li e concordo com os Termos de Uso e Política de Privacidade
            </Text>
          </Checkbox>

          <ErrorText text={fieldState.error?.message} />
        </>
      )}
    </View>
  );
};
