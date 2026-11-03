import { ClipboardList } from 'lucide-react-native';
import { Text, View } from 'react-native';

export const ActivitiesEmptyState = ({ message }: { message: string }) => (
  <View className="items-center gap-4 px-4 py-12">
    <View className="h-16 w-16 items-center justify-center rounded-full border-2 border-[#0686a3] bg-[#E6FBFF]">
      <ClipboardList color="#0095B3" size={30} strokeWidth={1.5} />
    </View>

    <Text className="text-center font-poppins text-sm text-[#455165]">
      {message}
    </Text>
  </View>
);
