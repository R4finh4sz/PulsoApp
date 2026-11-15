import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  FieldValues,
  useController,
  UseControllerProps,
} from 'react-hook-form';
import { ScrollView, Text, TextInput, View } from 'react-native';
import Animated, {
  Easing,
  LinearTransition,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { DropdownItem, TOption } from '@/components/ui/DropDown/item';
import ErrorText from '@/components/ui/ErrorText';
import useDropdown from '@/contexts/common/Dropdown';
import { colors } from '@/global/colors';
import fontFamily from '@/global/fontFamily';

import Pressable from '../Pressable';

type Props<TFieldValues extends FieldValues> = {
  options: TOption[];
  placeholder?: string;
  zIndex?: number;
  label?: string;
  editable?: boolean;
  searchable?: boolean;
  contextKey?: string;
  leftIcon?: React.ReactNode;
} & UseControllerProps<TFieldValues>;

const Dropdown = <TFieldValues extends FieldValues>({
  control,
  name,
  options,
  placeholder = 'Selecione uma opção',
  zIndex = 1,
  label,
  editable = true,
  searchable = false,
  disabled,
  contextKey,
  leftIcon,
}: Props<TFieldValues>) => {
  const { dropDownKey, setDropDownKey } = useDropdown();

  const [searchText, setSearchText] = useState('');

  const dropdownKey = contextKey || name;
  const isOpen = dropDownKey === dropdownKey;

  useEffect(() => () => setDropDownKey(''), [setDropDownKey]);

  useEffect(() => {
    if (isOpen && (disabled || !editable)) {
      setDropDownKey('');
    }
  }, [disabled, editable, isOpen, setDropDownKey]);

  useEffect(() => {
    if (!isOpen) {
      setSearchText('');
    }
  }, [isOpen]);

  const {
    field,
    fieldState: { error },
  } = useController({
    control,
    name,
  });

  const hasValue = !!field.value;

  const toggleDropdown = () => {
    if (disabled || !editable) {
      return;
    }
    setDropDownKey(isOpen ? '' : dropdownKey);
  };

  const handleSelect = (value: string) => {
    field.onChange(value);
    field.onBlur();
    setDropDownKey('');
  };

  const rotationStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: withTiming(isOpen ? '180deg' : '0deg', { duration: 200 }),
      },
    ],
  }));

  const filteredOptions = useMemo(() => {
    if (!searchText) {
      return options;
    }

    const normalizeText = (str: string) =>
      str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    const normalizedSearch = normalizeText(searchText);

    return options.filter(option =>
      normalizeText(option.label).includes(normalizedSearch),
    );
  }, [options, searchText]);

  const visibleText = useMemo(() => {
    if (field.value) {
      const selectedOption = options.find(opt => opt.value === field.value);
      return selectedOption?.label || placeholder;
    }
    return placeholder;
  }, [field.value, placeholder, options]);

  const layoutAnimation = LinearTransition.duration(220).easing(
    Easing.out(Easing.cubic),
  );

  return (
    <Animated.View
      className="w-full gap-2"
      layout={layoutAnimation}
      style={{ zIndex }}
    >
      {label && (
        <Text
          className="text-base text-neutral-80"
          style={{ fontFamily: fontFamily.poppins[0] }}
        >
          {label}
        </Text>
      )}

      <View className="w-full gap-px">
        <Pressable
          accessibilityLabel={label || placeholder}
          accessibilityRole="button"
          accessibilityState={{
            expanded: isOpen,
            disabled: disabled || !editable,
          }}
          className={`min-h-[50px] w-full flex-row items-center justify-between rounded-xl border px-4 py-3 ${
            isOpen || hasValue
              ? 'border-primary-100 bg-white'
              : 'border-neutral-20 bg-white'
          }`}
          disabled={disabled || !editable}
          onPress={toggleDropdown}
        >
          {leftIcon && <View className="mr-2">{leftIcon}</View>}

          <Text
            className={`flex-1 text-base ${
              field.value ? 'text-neutral-80' : 'text-neutral-40'
            }`}
            numberOfLines={1}
            style={{ fontFamily: fontFamily.poppins[0] }}
          >
            {visibleText}
          </Text>

          <Animated.View style={rotationStyle}>
            <Ionicons
              color={colors.primary[100]}
              name="chevron-down"
              size={20}
            />
          </Animated.View>
        </Pressable>

        {isOpen && (
          <View className="w-full rounded-xl border border-neutral-20 bg-white px-4 py-3">
            {searchable && (
              <View className="mb-3">
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="rounded-lg border border-neutral-20 bg-white px-3 py-2 text-base text-neutral-80"
                  placeholder="Pesquisar..."
                  placeholderTextColor={colors.neutral[40]}
                  style={{ fontFamily: fontFamily.poppins[0] }}
                  value={searchText}
                  onChangeText={setSearchText}
                />
              </View>
            )}

            <ScrollView
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 192 }}
            >
              {filteredOptions.length === 0 && (
                <Text
                  className="py-4 text-center text-sm text-neutral-60"
                  style={{ fontFamily: fontFamily.poppins[0] }}
                >
                  Nenhuma opção encontrada
                </Text>
              )}

              {filteredOptions.map((item, index) => (
                <View key={item.value}>
                  {index > 0 && <View className="h-px bg-neutral-20" />}

                  <DropdownItem
                    isSelected={field.value === item.value}
                    option={item}
                    onPress={() => handleSelect(item.value)}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <ErrorText text={error?.message} />
      </View>
    </Animated.View>
  );
};

export default Dropdown;
