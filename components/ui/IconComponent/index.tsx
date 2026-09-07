import type { ViewStyle } from 'react-native';

import * as Icon from '@/assets/icons';
import { colors } from '@/global/colors';

import Pressable from '../Pressable';

export type IconT = keyof typeof Icon;

type Props = {
  name: IconT;
  color?: string;
  size?: number;
  onPress?: () => void;
  style?: ViewStyle;
};

export const IconComponent = ({
  name,
  color = colors.secondary[100],
  size = 20,
  onPress,
  style,
}: Props) => {
  const IconEl = Icon[name];

  if (!IconEl) {
    return null;
  }

  if (onPress) {
    return (
      <Pressable hitSlop={4} style={style} onPress={onPress}>
        <IconEl color={color} height={size} width={size} />
      </Pressable>
    );
  }

  return <IconEl color={color} height={size} style={style} width={size} />;
};
