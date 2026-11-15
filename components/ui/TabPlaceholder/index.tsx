import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = { title: string; message: string };

export const TabPlaceholder = ({ title, message }: Props) => (
  <SafeAreaView className="flex-1 bg-neutral-background" edges={['top']}>
    <View className="w-full max-w-[560px] flex-1 self-center px-5 py-6">
      <Text className="font-poppins_bold text-2xl text-neutral-100">
        {title}
      </Text>

      <View className="flex-1 items-center justify-center">
        <Text className="text-center font-poppins text-sm text-neutral-60">
          {message}
        </Text>
      </View>
    </View>
  </SafeAreaView>
);
