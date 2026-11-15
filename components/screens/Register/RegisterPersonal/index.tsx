import { Control } from 'react-hook-form';
import { View } from 'react-native';

import Input from '@/components/ui/Input';
import { RegisterForm } from '@/validation/Register.validation';

export const RegisterPersonal = ({
  control,
}: {
  control: Control<RegisterForm>;
}) => (
  <View className="gap-6">
    <Input
      autoCapitalize="words"
      autoComplete="name"
      control={control}
      label="Nome completo"
      minHeight={48}
      multiline={false}
      name="name"
      placeholder="Digite seu nome completo"
    />

    <View>
      <Input
        control={control}
        keyboardType="number-pad"
        label="Data de nascimento"
        maxLength={10}
        minHeight={48}
        multiline={false}
        name="birthDate"
        options={{ mask: '99/99/9999' }}
        placeholder="DD/MM/AAAA"
        type="custom"
      />
    </View>

    <Input
      autoCapitalize="characters"
      control={control}
      keyboardType="number-pad"
      label="RA"
      minHeight={48}
      multiline={false}
      name="ra"
      placeholder="Digite seu RA"
    />
  </View>
);
