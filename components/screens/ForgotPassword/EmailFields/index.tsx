import { Control } from 'react-hook-form';

import Input from '@/components/ui/Input';

export type RecoveryEmailForm = { email: string };

type Props = { control: Control<RecoveryEmailForm>; onSubmit: () => void };

export const EmailFields = ({ control, onSubmit }: Props) => (
  <Input
    accessibilityLabel="E-mail"
    autoComplete="email"
    autoCorrect={false}
    control={control}
    keyboardType="email-address"
    label="E-mail"
    name="email"
    placeholder="Digite seu e-mail"
    returnKeyType="done"
    onSubmitEditing={onSubmit}
  />
);
