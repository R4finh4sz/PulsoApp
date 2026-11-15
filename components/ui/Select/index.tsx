import { ChevronDown, Check } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ErrorText from '@/components/ui/ErrorText';
import { colors } from '@/global/colors';

type Props = {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
};

const Select = ({
  label,
  value,
  options,
  onChange,
  disabled,
  error,
  placeholder = 'Selecione',
}: Props) => {
  const [open, setOpen] = useState(false);
  return (
    <View className="gap-1">
      <Text className="font-poppins text-base text-[#454545]">{label}</Text>

      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityState={{ disabled, expanded: open }}
        className="min-h-12 flex-row items-center justify-between rounded-lg border border-[#d1d0d0] bg-white px-3 py-3"
        disabled={disabled}
        onPress={() => setOpen(true)}
      >
        <Text
          className="mr-2 flex-1 font-poppins text-base"
          style={{ color: value ? colors.neutral[80] : colors.neutral[40] }}
        >
          {options.find(option => option.value === value)?.label ?? placeholder}
        </Text>

        <ChevronDown color={colors.primary[100]} size={22} />
      </Pressable>

      <ErrorText text={error} />

      <Modal
        animationType="slide"
        visible={open}
        onRequestClose={() => setOpen(false)}
      >
        <SafeAreaView className="flex-1 bg-white px-5">
          <View className="flex-row items-center justify-between py-5">
            <Text className="font-poppins_semibold text-lg">{label}</Text>

            <Pressable
              accessibilityRole="button"
              onPress={() => setOpen(false)}
            >
              <Text className="p-3 font-poppins_semibold text-primary-100">
                Fechar
              </Text>
            </Pressable>
          </View>

          <FlatList
            data={options}
            keyExtractor={item => item.value}
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected: item.value === value }}
                className="min-h-14 flex-row items-center justify-between border-b border-[#d1d0d0] py-4"
                onPress={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
              >
                <Text className="mr-3 flex-1 font-poppins text-base">
                  {item.label}
                </Text>

                {item.value === value && (
                  <Check color={colors.primary[100]} size={22} />
                )}
              </Pressable>
            )}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
};
export default Select;
