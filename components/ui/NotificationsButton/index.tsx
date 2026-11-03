import { router } from 'expo-router';
import { Bell } from 'lucide-react-native';

import Pressable from '@/components/ui/Pressable';

export const NotificationsButton = () => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel="Abrir notificações"
    className="mr-3 h-11 w-11 items-center justify-center rounded-full border border-[#CBD5E1] bg-white"
    onPress={() => router.push('/(main)/Notifications')}
  >
    <Bell color="#006D83" size={22} strokeWidth={1.8} />
  </Pressable>
);
