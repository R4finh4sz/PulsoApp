import Image from '@/components/ui/Image';
import { View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

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
          source={require('@/assets/images/LogoImageBlueAndYellow.png')}
          style={{ width: 200, height: 150 }}
        />
      </Animated.View>
    </View>
  );
};
