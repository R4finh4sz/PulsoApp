import { UseFormReturn } from 'react-hook-form';
import { View } from 'react-native';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { LoginForm } from '@/validation/Login.validation';

import { LoginActions } from '../LoginAction';

type Props = {
  control: UseFormReturn<LoginForm>['control'];
  onSubmit: () => void;
  isSubmitting?: boolean;
};

export const LoginFields = ({ control, onSubmit, isSubmitting }: Props) => {
  return (
    <View className="mb-4 mt-6 gap-6 px-4 py-3">
      <Input
        control={control}
        keyboardType="email-address"
        label="E-mail"
        name="email"
        placeholder="Digite seu e-mail"
      />

      <Input
        isPassword
        control={control}
        label="Senha"
        name="password"
        placeholder="Digite sua senha"
      />

      <LoginActions control={control} />

      <Button isLoading={isSubmitting} text="Entrar" onPress={onSubmit} />
    </View>
  );
};
