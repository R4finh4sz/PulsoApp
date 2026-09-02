import { LinearGradient } from 'expo-linear-gradient';
import { useCallback } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import colors from '@/global/colors';

interface Props {
  width?: number;
  height?: number;
  color?: string;
}

const Shimmer = ({
  width,
  height,
  color = colors.neutral.placeholder,
}: Props) => {
  const containerWidth = useSharedValue(0);
  const translateX = useSharedValue(0);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width: measuredWidth } = event.nativeEvent.layout;
    containerWidth.value = measuredWidth;

    if (measuredWidth > 0) {
      const startPosition = -measuredWidth * 3;
      const endPosition = measuredWidth;

      translateX.value = startPosition;

      translateX.value = withRepeat(
        withSequence(
          withTiming(endPosition * 2, {
            duration: 1500,
            easing: Easing.linear,
          }),
          withDelay(500, withTiming(startPosition, { duration: 0 })),
        ),
        -1,
        false,
      );
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <View
      className="overflow-hidden rounded-sm"
      style={{
        width: width || '100%',
        height: height || '100%',
        backgroundColor: color,
      }}
    >
      <View className="absolute inset-0" onLayout={onLayout}>
        <Animated.View className="flex-1 justify-center" style={animatedStyle}>
          <LinearGradient
            className="h-48 w-[300%] rotate-45"
            colors={['transparent', '#f5f5f5', 'transparent']}
          />
        </Animated.View>
      </View>
    </View>
  );
};

export default Shimmer;
