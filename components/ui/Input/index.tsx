import { useState } from 'react';
import {
  FieldValues,
  useController,
  UseControllerProps,
} from 'react-hook-form';
import {
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
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
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';

import colors from '@/global/colors';

import AnimatedText from '../AnimatedText';

type Props<TFieldValues extends FieldValues> = {
  label?: string;
  password?: boolean;
  placeholder?: string;
  type?: TextInputMaskTypeProp;
  options?: TextInputMaskOptionProp;
  animationProps?: AnimatedProps<ViewProps>;
} & TextInputProps &
  UseControllerProps<TFieldValues>;

const Input = <TFieldValues extends FieldValues>({
  label,
  password,
  placeholder,
  type,
  options,
  control,
  name,
  autoCapitalize = 'none',
  animationProps,
  ...props
}: Props<TFieldValues>) => {
  const [passwordHidden, setPasswordHidden] = useState(password);

  if (!control) {
    throw new Error('Control was not passed as a prop');
  }

  if (!name) {
    throw new Error('Name was not passed as a prop');
  }

  const {
    field,
    fieldState: { error },
  } = useController({
    control,
    name,
  });

  return (
    <Animated.View
      className="w-full gap-2"
      layout={LinearTransition}
      {...animationProps}
    >
      {label && <Text className="text-base text-primary-100">{label}</Text>}

      <View className="gap-px">
        <View className="flex-row items-center overflow-hidden rounded-xl border border-neutral-20">
          {type ? (
            <TextInputMask
              options={options}
              placeholder={placeholder}
              placeholderTextColor={colors.neutral[40]}
              refInput={field.ref}
              secureTextEntry={passwordHidden}
              style={{
                width: '100%',
                padding: 16,
                fontFamily: 'Poppins_400Regular',
                fontSize: 16,
                paddingRight: password ? 44 : undefined,
                color: colors.neutral[60],
              }}
              textAlignVertical="center"
              type={type}
              value={field.value}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              {...props}
            />
          ) : (
            <TextInput
              autoCapitalize={autoCapitalize}
              className="w-full p-4 text-neutral-60"
              placeholder={placeholder}
              placeholderTextColor={colors.neutral[40]}
              secureTextEntry={passwordHidden}
              style={{
                fontSize: 16,
                paddingRight: password ? 44 : undefined,
              }}
              value={field.value}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              {...props}
            />
          )}

          {password && (
            <TouchableOpacity
              className="absolute right-3 items-center justify-center"
              onPress={() => setPasswordHidden(!passwordHidden)}
            >
              <View
                className="h-6 w-6"
                style={{
                  backgroundColor: passwordHidden
                    ? colors.neutral[40]
                    : colors.primary[100],
                }}
              />
            </TouchableOpacity>
          )}
        </View>

        {error?.message && (
          <AnimatedText
            className="text-xs text-alert-error-primary"
            entering={FadeIn}
            exiting={FadeOut}
          >
            {error.message}
          </AnimatedText>
        )}
      </View>
    </Animated.View>
  );
};

export default Input;
