import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useDimensions = () => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const safeWidth = useMemo(() => {
    return width - insets.left - insets.right;
  }, [width, insets.left, insets.right]);

  const safeHeight = useMemo(() => {
    return height - insets.top - insets.bottom;
  }, [height, insets.top, insets.bottom]);

  return {
    width,
    height,
    safeWidth,
    safeHeight,
    insets,
  };
};
