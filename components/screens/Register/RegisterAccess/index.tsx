import { ImagePickerAsset } from 'expo-image-picker';
import { Control, useWatch } from 'react-hook-form';
import { Text, View } from 'react-native';

import Input from '@/components/ui/Input';
import ProfilePhotoPicker from '@/components/ui/ProfilePhotoPicker';
import {
  RegisterForm,
  requiresGuardian,
} from '@/validation/Register.validation';

type Props = {
  control: Control<RegisterForm>;
  photo: ImagePickerAsset | null;
  onPhotoChange: (photo: ImagePickerAsset | null) => void;
};
export const RegisterAccess = ({ control, photo, onPhotoChange }: Props) => {
  const birthDate = useWatch({ control, name: 'birthDate' });
  return (
    <View className="gap-5">
      <ProfilePhotoPicker value={photo} onChange={onPhotoChange} />

      <Input
        accessibilityLabel="E-mail"
        autoComplete="email"
        control={control}
        keyboardType="email-address"
        label="E-mail"
        minHeight={48}
        multiline={false}
        name="email"
        placeholder="Digite seu e-mail"
      />

      <Input
        isPassword
        accessibilityLabel="Digite sua senha"
        autoComplete="new-password"
        control={control}
        label="Digite sua senha"
        minHeight={48}
        multiline={false}
        name="password"
        placeholder="Use pelo menos 8 caracteres"
      />

      <Input
        isPassword
        accessibilityLabel="Confirme sua senha"
        autoComplete="new-password"
        control={control}
        label="Confirme sua senha"
        minHeight={48}
        multiline={false}
        name="confirmPassword"
        placeholder="Digite sua senha novamente"
      />

      {requiresGuardian(birthDate) && (
        <View className="gap-5">
          <Text className="font-poppins text-sm text-neutral-80">
            Como você tem menos de 18 anos, informe seu responsável legal. A
            escola conferirá os dados antes de enviar a confirmação ao
            responsável.
          </Text>

          <Input
            accessibilityLabel="Nome do responsável legal"
            control={control}
            label="Nome do responsável legal"
            maxLength={100}
            minHeight={48}
            multiline={false}
            name="guardianName"
            placeholder="Digite o nome do responsável"
          />

          <Input
            accessibilityLabel="E-mail do responsável legal"
            autoComplete="email"
            control={control}
            keyboardType="email-address"
            label="E-mail do responsável legal"
            maxLength={254}
            minHeight={48}
            multiline={false}
            name="guardianEmail"
            placeholder="Digite o e-mail do responsável"
          />
        </View>
      )}
    </View>
  );
};
