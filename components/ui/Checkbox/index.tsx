import { ReactNode } from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { View } from 'react-native';

import { colors } from '@/global/colors';

import Icon from '../Icon';
import Pressable from '../Pressable';

type DefaultCheckboxProps = {
  checked: boolean;
  onToggle: (value: boolean) => void;
  children: ReactNode;
  control?: never;
  name?: never;
};

type ControlledCheckboxProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  children: ReactNode;
  checked?: never;
  onToggle?: never;
};

type CheckboxProps<T extends FieldValues = FieldValues> =
  | DefaultCheckboxProps
  | ControlledCheckboxProps<T>;

const Checkbox = <T extends FieldValues = FieldValues>(
  props: CheckboxProps<T>,
) => {
  if ('control' in props && props.control) {
    const { control, name, children } = props;

    return (
      <Controller
        control={control}
        name={name}
        render={({ field: { value, onChange } }) => (
          <Pressable
            className="flex-row items-center gap-2"
            onPress={() => onChange(!value)}
          >
            <View
              className="h-6 w-6 shrink-0 items-center justify-center rounded-md"
              style={{
                backgroundColor: value ? colors.primary[100] : undefined,
                borderColor: colors.primary[100],
                borderWidth: value ? 0 : 1,
              }}
            >
              {value && (
                <Icon color={colors.white} name="CheckIcon" size={14} />
              )}
            </View>

            {children}
          </Pressable>
        )}
      />
    );
  }

  const { checked, onToggle, children } = props;

  return (
    <Pressable
      className="flex-row items-center gap-2"
      onPress={() => onToggle(!checked)}
    >
      <View
        className="h-6 w-6 shrink-0 items-center justify-center rounded-md"
        style={{
          backgroundColor: checked ? colors.primary[100] : undefined,
          borderColor: colors.primary[100],
          borderWidth: checked ? 0 : 1,
        }}
      >
        {checked && <Icon color={colors.white} name="CheckIcon" size={14} />}
      </View>

      <View className="flex-1">{children}</View>
    </Pressable>
  );
};

export default Checkbox;
