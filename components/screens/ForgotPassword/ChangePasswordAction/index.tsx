import { View } from 'react-native';

import Button from '@/components/ui/Button';

type Props = { disabled: boolean; onSubmit: () => void };

export const ChangePasswordAction = ({ disabled, onSubmit }: Props) => (
  <View className="flex-1 justify-end pb-3 pt-6">
    <Button
      withShadow
      color="#0095B3"
      disabled={disabled}
      text="Salvar"
      textClassName="font-poppins_bold text-base"
      onPress={onSubmit}
    />
  </View>
);
