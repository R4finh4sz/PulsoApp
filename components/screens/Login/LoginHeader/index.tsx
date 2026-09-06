import { View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import logoBlueAndYellow from '@/assets/images/LogoImageBlueAndYellow.png';
import Image from '@/components/ui/Image';

type Props = {
  shouldAnimate?: boolean;
};

export const LoginHeader = ({ shouldAnimate = false }: Props) => {
  return (
    <View className="relative h-[180px] w-full overflow-hidden">
      <Animated.View
        className="absolute inset-0 top-3 items-center justify-center"
        entering={shouldAnimate ? ZoomIn.delay(200).duration(1200) : undefined}
      >
        <Image
          contentFit="contain"
          source={logoBlueAndYellow}
          style={{ width: 200, height: 150 }}
        />
      </Animated.View>
    </View>
  );
};
