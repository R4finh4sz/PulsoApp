import { View } from 'react-native';

import logo from '@/assets/images/LogoImageBlueAndYellow.png';
import Image from '@/components/ui/Image';

export const EmailHeader = () => (
  <View style={{ alignItems: 'center' }}>
    <Image
      contentFit="contain"
      source={logo}
      style={{ width: 200, height: 150 }}
    />
  </View>
);
