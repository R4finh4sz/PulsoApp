import { ImagePickerAsset } from 'expo-image-picker';
import { Control } from 'react-hook-form';
import { View } from 'react-native';

import Input from '@/components/ui/Input';
import ProfilePhotoPicker from '@/components/ui/ProfilePhotoPicker';
import { RegisterForm } from '@/validation/Register.validation';

type Props = {
  control: Control<RegisterForm>;
  photo: ImagePickerAsset | null;
  onPhotoChange: (photo: ImagePickerAsset | null) => void;
};
export const RegisterAccess = ({ control, photo, onPhotoChange }: Props) => (
  <View className="gap-5">
    <ProfilePhotoPicker value={photo} onChange={onPhotoChange} />

    <Input
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
      autoComplete="new-password"
      control={control}
      label="Confirme sua senha"
      minHeight={48}
      multiline={false}
      name="confirmPassword"
      placeholder="Digite sua senha novamente"
    />
  </View>
);
