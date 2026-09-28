import { Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import { Control, useController } from 'react-hook-form';
import { Text, TextInput, View } from 'react-native';

import Pressable from '@/components/ui/Pressable';
import { ChangePasswordForm } from '@/validation/ForgotPassword.validation';

type Props = {
  control: Control<ChangePasswordForm>;
  name: keyof ChangePasswordForm;
  label: string;
  placeholder: string;
  onSubmit?: () => void;
};

export const ResetPasswordField = ({
  control,
  name,
  label,
  placeholder,
  onSubmit,
}: Props) => {
  const [hidden, setHidden] = useState(true);
  const {
    field,
    fieldState: { error },
  } = useController({ control, name });
  const VisibilityIcon = hidden ? EyeOff : Eye;

  return (
    <View className="gap-2">
      <Text className="font-poppins text-sm text-neutral-80">{label}</Text>

      <View className="flex-row items-center rounded-lg border border-neutral-20 bg-white">
        <TextInput
          ref={field.ref}
          accessibilityLabel={label}
          autoCapitalize="none"
          autoComplete="new-password"
          autoCorrect={false}
          className="min-h-11 flex-1 px-3 py-2 font-poppins text-sm text-neutral-80 placeholder:text-neutral-40"
          placeholder={placeholder}
          returnKeyType={onSubmit ? 'done' : 'next'}
          secureTextEntry={hidden}
          textContentType="newPassword"
          value={field.value}
          onBlur={field.onBlur}
          onChangeText={field.onChange}
          onSubmitEditing={onSubmit}
        />

        <Pressable
          accessibilityLabel={`${hidden ? 'Mostrar' : 'Ocultar'} ${label.toLowerCase()}`}
          accessibilityRole="button"
          className="h-11 w-11 items-center justify-center"
          onPress={() => setHidden(value => !value)}
        >
          <VisibilityIcon color="#42B9D4" size={21} strokeWidth={1.5} />
        </Pressable>
      </View>

      {error && (
        <Text
          accessibilityRole="alert"
          className="font-poppins text-xs text-alert-error-primary"
        >
          {error.message}
        </Text>
      )}
    </View>
  );
};
