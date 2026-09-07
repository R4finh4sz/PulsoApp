import { View } from 'react-native';

import Button from '@/components/ui/Button';

type Props = { disabled: boolean; onSubmit: () => void };

export const EmailAction = ({ disabled, onSubmit }: Props) => (
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
      text="Prosseguir"
      onPress={onSubmit}
    />
  </View>
);
