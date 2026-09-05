import { ActivityIndicator, View } from 'react-native';

import { colors } from '@/global/colors';

const ButtonActivityIndicator = () => (
  <View className="absolute inset-0 items-center justify-center bg-black/20">
    <ActivityIndicator color={colors.white} size="small" />
  </View>
);

export default ButtonActivityIndicator;
