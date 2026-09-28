import { UseFormReturn } from 'react-hook-form';
import { ActivityIndicator, Text, View } from 'react-native';

import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/DropDown';
import ErrorText from '@/components/ui/ErrorText';
import Input from '@/components/ui/Input';
import { colors } from '@/global/colors';
import { useRegistrationLocation } from '@/hooks/useRegistrationLocation';
import { RegisterForm } from '@/validation/Register.validation';

type Props = {
  form: UseFormReturn<RegisterForm>;
  location: ReturnType<typeof useRegistrationLocation>;
};
export const RegisterSchool = ({ form: { control }, location }: Props) => (
  <View className="gap-5">
    <Input
      control={control}
      keyboardType="number-pad"
      label="CEP da escola"
      maxLength={9}
      minHeight={48}
      multiline={false}
      name="cep"
      options={{ mask: '99999-999' }}
      placeholder="Digite o CEP"
      type="custom"
    />

    <Input
      control={control}
      editable={false}
      label="Cidade"
      minHeight={48}
      multiline={false}
      name="city"
      placeholder="Preenchida pelo CEP"
    />

    <Input
      control={control}
      editable={false}
      label="Estado"
      minHeight={48}
      multiline={false}
      name="state"
      placeholder="Preenchido pelo CEP"
    />

    {location.loading && (
      <View className="flex-row items-center gap-2">
        <ActivityIndicator color={colors.primary[100]} />

        <Text className="font-poppins text-sm text-neutral-60">
          Buscando CEP e escolas...
        </Text>
      </View>
    )}

    <Dropdown
      searchable
      control={control}
      disabled={!location.ready || !location.schools.length}
      label="Escola"
      name="schoolId"
      options={location.schools.map(school => ({
        value: school.id,
        label: school.name,
      }))}
      placeholder="Selecione sua escola"
    />

    {location.ready && !location.schools.length && (
      <Text className="font-poppins text-sm text-neutral-60">
        Nenhuma escola cadastrada nessa cidade. Confira o CEP ou entre em
        contato com sua escola.
      </Text>
    )}

    {!!location.error && (
      <>
        <ErrorText text={location.error} />

        <Button
          wired
          text="Tentar consulta novamente"
          onPress={location.retry}
        />
      </>
    )}
  </View>
);
