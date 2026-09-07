import { useEffect, useState } from 'react';
import {
  FieldValues,
  useController,
  UseControllerProps,
} from 'react-hook-form';
import {
  StyleProp,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewProps,
} from 'react-native';
import {
  TextInputMask,
  TextInputMaskOptionProp,
  TextInputMaskTypeProp,
} from 'react-native-masked-text';
import Animated, {
  AnimatedProps,
  LinearTransition,
} from 'react-native-reanimated';

import { colors } from '@/global/colors';
import fontFamily from '@/global/fontFamily';

import ErrorText from '../ErrorText';
import Icon, { IconProps } from '../Icon';
import Pressable from '../Pressable';

type Props<TFieldValues extends FieldValues> = {
  label?: string;
  isPassword?: boolean;
  placeholder?: string;
  type?: TextInputMaskTypeProp;
  options?: TextInputMaskOptionProp;
  minHeight?: number;
  containerProps?: AnimatedProps<ViewProps>;
  icon?: IconProps;
  leftIcon?: IconProps;
  suffix?: string;
  unit?: string;
} & TextInputProps &
  UseControllerProps<TFieldValues>;

const Input = <TFieldValues extends FieldValues>({
  label,
  isPassword,
  placeholder,
  type,
  options,
  control,
  name,
  autoCapitalize = 'none',
  minHeight,
  containerProps,
  icon,
  leftIcon,
  multiline,
  maxLength,
  suffix,
  unit,
  ...props
}: Props<TFieldValues>) => {
  const [passwordHidden, setPasswordHidden] = useState(isPassword);
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const length = () => {
    if (maxLength) {
      return maxLength;
    }
    if (multiline || minHeight) {
      return 250;
    }
    return 100;
  };

  const {
    field,
    fieldState: { error },
  } = useController({
    control,
    name,
  });

  const formatWithSuffix = (value: string) => {
    if (!suffix) {
      return value;
    }

    const numbers = value.replace(/\D/g, '');
    if (!numbers) {
      return '';
    }

    const formatted = parseInt(numbers, 10).toLocaleString('pt-BR');
    return `${formatted}${suffix}`;
  };

  const getDisplayValue = () => {
    const value = field.value || '';

    if (isFocused) {
      return value.toString();
    }

    if (unit && value) {
      const cleanValue = (value as string).toString().replace(/\D/g, '');

      if (!cleanValue) {
        return '';
      }

      let formatted = '';

      if (cleanValue.length === 1) {
        formatted = `0,${cleanValue}`;
      } else if (cleanValue.length === 2) {
        formatted = `${cleanValue[0]},${cleanValue[1]}`;
      } else {
        const decimal = cleanValue.slice(-1);
        const integer = cleanValue.slice(0, -1);

        const formattedInteger = parseInt(integer, 10).toLocaleString('pt-BR');
        formatted = `${formattedInteger},${decimal}`;
      }

      return `${formatted}${unit}`;
    }

    return value.toString();
  };

  const handleChangeText = (text: string) => {
    if (suffix) {
      const numbers = text.replace(/\D/g, '');

      if (numbers === '') {
        field.onChange('');
        setDisplayValue('');
      } else {
        field.onChange(numbers);
        setDisplayValue(formatWithSuffix(numbers));
      }
    } else if (unit) {
      const cleanText = text.replace(/\D/g, '');
      field.onChange(cleanText);
    } else {
      field.onChange(text);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    field.onBlur();
  };

  useEffect(() => {
    if (suffix && field.value) {
      setDisplayValue(formatWithSuffix(field.value));
    } else if (suffix && !field.value) {
      setDisplayValue('');
    }
  }, [field.value, suffix]);

  const inputStyle: StyleProp<TextStyle> = {
    flexGrow: 1,
    height: '100%',
    padding: 6,
    fontFamily: fontFamily.poppins[0],
    fontSize: 16,
    color: colors.neutral[80],
    paddingRight: isPassword || icon ? 44 : undefined,
    paddingLeft: leftIcon ? 44 : 10,
  };

  const commonProps: TextInputProps = {
    autoCapitalize,
    maxLength: length(),
    multiline: !!minHeight || multiline,
    placeholder,
    placeholderTextColor: '#8B8B8B',
    secureTextEntry: passwordHidden,
    style: inputStyle,
    textAlignVertical: 'top',
    value: unit ? getDisplayValue() : suffix ? displayValue : field.value,
    onChangeText: handleChangeText,
    onBlur: handleBlur,
    onFocus: unit ? handleFocus : undefined,
    ...props,
  };

  return (
    <Animated.View
      className="w-full gap-1"
      layout={LinearTransition}
      {...containerProps}
    >
      {label && (
        <Text className="font-poppins_regular text-base text-[#454545]">
          {label}
        </Text>
      )}

      <View className="w-full gap-px">
        <View
          className="w-full flex-row items-center rounded-lg border border-[#d1d0d0] bg-white"
          style={{ minHeight }}
        >
          {leftIcon && (
            <View className="absolute left-2 self-center">
              <Icon {...leftIcon} />
            </View>
          )}

          {type ? (
            <TextInputMask
              options={options}
              refInput={field.ref}
              type={type}
              {...commonProps}
            />
          ) : (
            <TextInput ref={field.ref} {...commonProps} />
          )}

          {isPassword && (
            <Pressable
              className="absolute right-2 items-center justify-center overflow-hidden rounded-full p-1"
              onPress={() => {
                setPasswordHidden(!passwordHidden);
              }}
            >
              <Icon
                key={passwordHidden ? 'EyeOff' : 'Eye'}
                name={passwordHidden ? ('EyeOff' as const) : ('Eye' as const)}
                size={24}
                strokeWidth={1.5}
              />
            </Pressable>
          )}

          {icon && (
            <View className="absolute right-2 self-center">
              <Icon {...icon} />
            </View>
          )}
        </View>

        <ErrorText text={error?.message} />
      </View>
    </Animated.View>
  );
};

export default Input;
