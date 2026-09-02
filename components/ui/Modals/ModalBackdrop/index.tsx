/* eslint-disable no-restricted-imports */
import { PropsWithChildren, ReactNode, useEffect } from 'react';
import { BackHandler, Pressable, Text, View } from 'react-native';
import {
  KeyboardAvoidingView,
  KeyboardController,
} from 'react-native-keyboard-controller';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';

import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { colors } from '@/global/colors';
import { useDimensions } from '@/hooks/common';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ModalVariant = 'success' | 'warning' | 'error' | 'info';

type ButtonConfig = {
  text: string;
  onPress: () => void;
  className?: string;
  textClassName?: string;
  color?: string;
  textColor?: string;
  wired?: boolean;
};

type Props = {
  visible?: boolean;
  onPress?: () => void;
  onClose?: () => void;
  variant?: ModalVariant;
  showIcon?: boolean;
  title?: string;
  titleClassName?: string;
  message?: string | ReactNode | string[];
  showButton?: boolean;
  buttonText?: string;
  buttons?: ButtonConfig[];
  listItems?: string[];
};

const ModalBackdrop = ({
  visible = true,
  onPress,
  onClose,
  children,
  variant = 'success',
  showIcon = true,
  title,
  titleClassName = 'font-poppins_semibold text-xl',
  message,
  buttonText = 'Continuar',
  showButton = false,
  buttons,
  listItems,
}: PropsWithChildren<Props>) => {
  const { height, width } = useDimensions();

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return 'SuccessIconModal';
      case 'warning':
        return 'WarningIcon';
      case 'error':
        return 'ErrorIcon';
      default:
        return 'SuccessIconModal';
    }
  };

  const getIconBackgroundColor = () => {
    switch (variant) {
      case 'success':
        return colors.ModalColor.success;
      case 'warning':
        return colors.ModalColor.warning;
      case 'error':
        return colors.ModalColor.error;
      default:
        return colors.primary[100];
    }
  };

  const getButtonColor = () => {
    switch (variant) {
      case 'success':
        return colors.primary[100];
      case 'warning':
        return colors.tertiary[100];
      case 'error':
        return colors.alert.error.primary;
      case 'info':
        return colors.primary[100];
      default:
        return colors.primary[100];
    }
  };

  useEffect(() => {
    const handlePress = onClose || onPress;
    if (!handlePress) {
      return;
    }

    const backHandler = () => {
      handlePress();
      return true;
    };
    const backHandlerListener = BackHandler.addEventListener(
      'hardwareBackPress',
      backHandler,
    );
    return () => {
      backHandlerListener.remove();
    };
  }, [onPress, onClose]);

  useEffect(() => {
    KeyboardController.dismiss();
  }, []);

  if (!visible) {
    return null;
  }

  const handlePress = onClose || onPress;

  const renderMessage = () => {
    if (!message) {
      return null;
    }

    if (typeof message === 'string') {
      return (
        <View className="mt-4">
          {message.split('\n').map((line, index) => (
            <Text
              key={index}
              className="font-regular text-center text-base text-black"
              style={{
                marginBottom: index < message.split('\n').length - 1 ? 4 : 0,
              }}
            >
              {line}
            </Text>
          ))}
        </View>
      );
    }

    if (Array.isArray(message)) {
      return (
        <View className="mt-4">
          {message.map((line, index) => (
            <Text
              key={index}
              className="font-regular text-center text-base text-black"
              style={{ marginBottom: index < message.length - 1 ? 4 : 0 }}
            >
              {line}
            </Text>
          ))}
        </View>
      );
    }

    return <View className="mt-4">{message}</View>;
  };

  if (title || message) {
    return (
      <Animated.View
        className="absolute z-[9999] h-full w-screen items-center justify-center bg-black/70"
        entering={FadeIn}
        exiting={FadeOut}
        style={{ height, width }}
      >
        <View className="w-[90%] max-w-md overflow-hidden rounded-xl bg-[#FEFEFE] px-6 py-4">
          {showIcon && (
            <View className="items-center">
              <View
                className="h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: getIconBackgroundColor() }}
              >
                <Icon name={getIcon()} size={28} />
              </View>
            </View>
          )}

          <View className="items-center text-center">
            {title && (
              <Text
                className={`mt-6 text-center text-lg font-semibold text-black ${titleClassName}`}
              >
                {title}
              </Text>
            )}

            {renderMessage()}

            {listItems && listItems.length > 0 && (
              <View className="mt-2 w-full">
                {listItems.map((item, index) => (
                  <View key={index} className="mb-3 flex-row">
                    <Text className="font-regular text-base text-black">
                      • {item}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {showButton && handlePress && (
              <View className="mt-8 w-full">
                <Button
                  color={getButtonColor()}
                  text={buttonText}
                  textClassName="text-base font-bold"
                  onPress={handlePress}
                />
              </View>
            )}

            {buttons && buttons.length > 0 && (
              <View
                className={`mt-8 w-full ${buttons.length > 1 ? 'flex-row gap-3' : ''}`}
              >
                {buttons.map((button, index) => (
                  <Button
                    key={index}
                    color={button.color || getButtonColor()}
                    text={button.text}
                    textClassName={button.textClassName}
                    textColor={button.textColor}
                    width={buttons.length > 1 ? '48%' : '100%'}
                    wired={button.wired}
                    withShadow={false}
                    onPress={button.onPress}
                  />
                ))}
              </View>
            )}

            {children}
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      className="absolute z-[9999] w-screen bg-black/60"
      entering={FadeIn}
      exiting={FadeOut}
      style={{ height, width }}
    >
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <Pressable
          className="flex-1 items-center justify-center"
          onPress={handlePress}
        >
          <AnimatedPressable
            className="w-[90%]"
            layout={LinearTransition}
            onPress={e => e.stopPropagation()}
          >
            {showIcon && (
              <View className="mb-4 items-center">
                <Icon name={getIcon()} size={64} />
              </View>
            )}

            {children}
          </AnimatedPressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Animated.View>
  );
};

export default ModalBackdrop;
