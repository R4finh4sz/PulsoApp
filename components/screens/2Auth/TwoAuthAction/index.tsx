import { View } from 'react-native';

import Button from '@/components/ui/Button';

type Props = { disabled: boolean; isLoading: boolean; onSubmit: () => void };

export const TwoAuthAction = ({ disabled, isLoading, onSubmit }: Props) => (
  <View
    style={{
      flex: 1,
      justifyContent: 'flex-end',
      paddingTop: 64,
      paddingBottom: 80,
      width: '100%',
      maxWidth: 322,
      alignSelf: 'center',
    }}
  >
    <Button
      disabled={disabled}
      isLoading={isLoading}
      text="Confirmar"
      onPress={onSubmit}
    />
  </View>
);
