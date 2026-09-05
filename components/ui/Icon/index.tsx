import { createElement, type ComponentType } from 'react';
import {
  Check,
  CircleCheck,
  CircleX,
  Eye,
  EyeOff,
  Info,
  TriangleAlert,
} from 'lucide-react-native';
import { PressableProps, ViewStyle } from 'react-native';

import * as IconAssets from '@/assets/icons/index';

import Pressable from '@/components/ui/Pressable';
import colors from '@/global/colors';

const fallbackIcons = {
  CheckIcon: Check,
  ErrorIcon: CircleX,
  Eye,
  EyeOff,
  InfoIcon: Info,
  SuccessIconModal: CircleCheck,
  WarningIcon: TriangleAlert,
};

export type TIcon = keyof typeof IconAssets | keyof typeof fallbackIcons;

export type IconProps = {
  name?: TIcon;
  size?: number;
  style?: ViewStyle;
  color?: string;
  strokeWidth?: number;
  rotate?: number;
  fill?: string;
  onPress?: () => void;
  pressableProps?: Omit<PressableProps, 'onPress' | 'children' | 'className'>;
  LucideIcon?: any;
};

const Icon = ({
  name,
  size = 24,
  color = colors.primary[100],
  strokeWidth = 2,
  style,
  rotate = 0,
  fill = 'none',
  onPress,
  pressableProps = {
    style: { padding: 4, margin: -4 },
  },
  LucideIcon,
}: IconProps) => {
  const renderIcon = () => {
    if (LucideIcon) {
      return (
        <LucideIcon
          color={color}
          size={size}
          strokeWidth={strokeWidth}
          style={style}
        />
      );
    }

    if (!name) {
      return null;
    }

    const IconComponent = (IconAssets[name as keyof typeof IconAssets] ||
      fallbackIcons[name as keyof typeof fallbackIcons]) as ComponentType<any>;

    if (!IconComponent) {
      return null;
    }

    return createElement(IconComponent, {
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
  };

  if (onPress) {
    return (
      <Pressable
        className="overflow-hidden rounded-full"
        onPress={onPress}
        {...pressableProps}
      >
        <>{renderIcon()}</>
      </Pressable>
    );
  }

  return renderIcon();
};

export default Icon;
