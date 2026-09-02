/* eslint-disable no-restricted-imports */
import { PropsWithChildren } from 'react';
import {
  PressableProps,
  Pressable as RNPressable,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';

type Props = {
  showFeedback?: boolean;
  style?: StyleProp<ViewStyle>;
} & PressableProps;

const Pressable = ({
  showFeedback = true,
  children,
  style,
  ...props
}: PropsWithChildren<Props>) => {
  return (
    <RNPressable style={[{ overflow: 'hidden' }, style]} {...props}>
      {({ pressed }) => (
        <>
          {children}

          {pressed && showFeedback && (
            <View className="absolute inset-0 bg-black/10" />
          )}
        </>
      )}
    </RNPressable>
  );
};

export default Pressable;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export { AnimatedPressable };
