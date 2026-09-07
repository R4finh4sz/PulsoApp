import { PropsWithChildren } from 'react';
import {
  DimensionValue,
  GestureResponderEvent,
  PressableProps,
  Text,
} from 'react-native';
import { AnimatedProps, LinearTransition } from 'react-native-reanimated';

import { colors } from '@/global/colors';
import { shadow } from '@/global/shadow';
import useDisableDelay from '@/hooks/useDisableDelay';

import Icon, { IconProps } from '../Icon';
import { AnimatedPressable } from '../Pressable';

import ButtonActivityIndicator from './ButtonActivityIndicator';

type Props = {
  text?: string;
  wired?: boolean;
  color?: string;
  textColor?: string;
  textClassName?: string;
  leftIcon?: IconProps;
  rightIcon?: IconProps;
  isLoading?: boolean;
  width?: DimensionValue;
  withoutDelay?: boolean;
  withShadow?: boolean;
  shadowVariant?: keyof typeof shadow;
} & PressableProps &
  AnimatedProps<PropsWithChildren<PressableProps>>;

const Button = ({
  text,
  wired = false,
  color = colors.primary[100],
  textColor,
  textClassName,
  isLoading = false,
  onPress,
  withoutDelay = false,
  width = '100%',
  leftIcon,
  rightIcon,
  withShadow = false,
  shadowVariant = 'default',
  disabled,
  className,
  ...props
}: PropsWithChildren<Props & { className?: string }>) => {
  const { executeWithDelay, isLoading: loading } = useDisableDelay();

  const handleColor = () => {
    if (disabled) {
      return colors.neutral[20];
    }

    if (wired) {
      return undefined;
    }

    return color;
  };

  const handleTextColor = () => {
    if (disabled) {
      return '#FCFCFC';
    }

    if (textColor) {
      return textColor;
    }

    if (wired) {
      return color;
    }

    return '#FCFCFC';
  };

  const handlePress = async (e: GestureResponderEvent) => {
    if (!onPress) {
      return;
    }

    if (withoutDelay) {
      onPress(e);
      return;
    }

    await executeWithDelay(() => onPress(e));
  };

  return (
    <AnimatedPressable
      className={`flex-row items-center justify-center gap-3 overflow-hidden rounded-lg border p-1 ${className}`}
      disabled={disabled || isLoading || loading}
      layout={LinearTransition}
      style={{
        backgroundColor: handleColor(),
        borderColor: wired ? color : colors.transparent,
        width,
        ...(withShadow && !wired ? shadow[shadowVariant] : {}),
      }}
      onPress={handlePress}
      {...props}
    >
      {leftIcon && (
        <Icon color={leftIcon.color || handleTextColor()} {...leftIcon} />
      )}

      <Text
        className={textClassName || 'font-poppins_semibold text-base'}
        style={{
          color: handleTextColor(),
        }}
      >
        {text}
      </Text>

      {rightIcon && (
        <Icon color={rightIcon.color || handleTextColor()} {...rightIcon} />
      )}

      {(isLoading || loading) && <ButtonActivityIndicator />}
    </AnimatedPressable>
  );
};

export default Button;
