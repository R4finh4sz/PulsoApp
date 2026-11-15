import { Control, useWatch } from 'react-hook-form';
import { View } from 'react-native';

import Input from '@/components/ui/Input';
import { ChangePasswordForm } from '@/validation/ForgotPassword.validation';

import { PasswordRequirements } from '../PasswordRequirements';

type Props = {
  control: Control<ChangePasswordForm>;
  onSubmit: () => void;
};

export const ChangePasswordFields = ({ control, onSubmit }: Props) => {
  const password = useWatch({ control, name: 'password' });

  return (
    <View className="gap-5">
      <Input
        isPassword
        accessibilityLabel="Senha"
        autoComplete="new-password"
        autoCorrect={false}
        control={control}
        label="Senha"
        name="password"
        placeholder="Digite sua senha"
        textContentType="newPassword"
      />

      <PasswordRequirements password={password} />

      <Input
        isPassword
        accessibilityLabel="Confirmar senha"
        autoComplete="new-password"
        autoCorrect={false}
        control={control}
        label="Confirmar senha"
        name="confirmPassword"
        placeholder="Digite sua senha novamente"
        returnKeyType="done"
        textContentType="newPassword"
        onSubmitEditing={onSubmit}
      />
    </View>
  );
};
