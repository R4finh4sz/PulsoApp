import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

import colors from '@/global/colors';

type Props = {
  isChecked?: boolean;
} & TouchableOpacityProps;

const Checkbox = ({ isChecked, ...props }: Props) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className="h-6 w-6 rounded-full"
      style={{
        borderWidth: isChecked ? 3 : 2,
        borderColor: isChecked
          ? colors.alert.success.primary
          : colors.neutral[60],
        backgroundColor: isChecked
          ? colors.alert.success.secondary
          : 'transparent',
      }}
      {...props}
    />
  );
};

export default Checkbox;
