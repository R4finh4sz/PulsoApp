import { ViewStyle } from 'react-native';

import * as Assets from '@/assets/icons';
import colors from '@/global/colors';

export type IconT = keyof typeof Assets;

export interface IconProps {
  name: IconT;
  size: number;
  style?: ViewStyle;
  color?: string;
  strokeWidth?: number;
  rotate?: number;
  fill?: string;
}

const Icon = ({
  name,
  size,
  color = colors.neutral[100],
  strokeWidth = 2,
  style,
  rotate = 0,
  fill = 'none',
}: IconProps) => {
  if (name && !!Assets?.[name]) {
    return Assets[name]({
      width: size,
      height: size,
      color,
      strokeWidth,
      style,
      fill,
      transform: [
        {
          rotate: `${rotate}deg`,
        },
      ],
    });
  }
};

export default Icon;
