import { PressableProps, Text } from 'react-native';

import Pressable from '@/components/ui/Pressable';
import { colors } from '@/global/colors';
import fontFamily from '@/global/fontFamily';

export type TOption = {
  label: string;
  value: string;
  subtitle?: string;
  address?: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
};

export type Props = {
  option: TOption;
  isSelected?: boolean;
} & PressableProps;

export const DropdownItem = ({
  option,
  isSelected = false,
  ...props
}: Props) => {
  const formatAddress = () => {
    if (!option.address) {
      return null;
    }

    const { street, number, neighborhood, city, state } = option.address;
    return `${street}, ${number} - ${neighborhood}, ${city} - ${state}`;
  };

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      className="w-full py-2.5"
      {...props}
    >
      <Text
        numberOfLines={2}
        style={{
          fontFamily: fontFamily.poppins[0],
          fontSize: 14,
          color: isSelected ? colors.primary[100] : colors.neutral[80],
        }}
      >
        {option.label}
      </Text>

      {option.address && (
        <Text
          numberOfLines={1}
          style={{
            fontFamily: fontFamily.poppins[0],
            fontSize: 12,
            color: colors.neutral[60],
            marginTop: 4,
          }}
        >
          {formatAddress()}
        </Text>
      )}
    </Pressable>
  );
};
