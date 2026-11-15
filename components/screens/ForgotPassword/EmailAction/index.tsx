import { View } from 'react-native';

import Button from '@/components/ui/Button';

type Props = { disabled: boolean; isLoading?: boolean; onSubmit: () => void };

export const EmailAction = ({ disabled, isLoading, onSubmit }: Props) => (
  <View
    style={{
      flex: 1,
      justifyContent: 'flex-end',
      paddingTop: 48,
      paddingHorizontal: 22,
      paddingBottom: 72,
    }}
  >
    <Button
      color="#0095B3"
      disabled={disabled}
      isLoading={isLoading}
      text="Prosseguir"
      onPress={onSubmit}
    />
  </View>
);
