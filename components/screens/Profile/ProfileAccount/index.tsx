import {
  ChevronRight,
  FileDown,
  FileText,
  LockKeyhole,
  Trash2,
} from 'lucide-react-native';
import { Text, View } from 'react-native';

import Pressable from '@/components/ui/Pressable';
import { shadow } from '@/global/shadow';

const accountActions = [
  { label: 'Alterar senha', icon: LockKeyhole },
  { label: 'Exportação de dados', icon: FileDown },
  { label: 'Termos de uso', icon: FileText },
  { label: 'Exclusão de conta', icon: Trash2 },
];

export const ProfileAccount = () => (
  <View className="mt-9">
    <Text className="mb-3 font-poppins_bold text-sm text-[#4B5563]">Conta</Text>

    <View className="gap-4">
      {accountActions.map(({ label, icon: Icon }) => (
        <View
          key={label}
          className="rounded-[14px] bg-neutral-background"
          style={shadow.default}
        >
          <Pressable
            accessibilityLabel={label}
            accessibilityRole="button"
            className="min-h-[52px] flex-row items-center gap-[13px] rounded-[14px] px-4 py-[15px]"
          >
            <Icon color="#4B5563" size={23} strokeWidth={1.7} />

            <Text className="flex-1 font-poppins_medium text-[13px] text-[#4B5563]">
              {label}
            </Text>

            <ChevronRight color="#BFC5CB" size={20} strokeWidth={1.7} />
          </Pressable>
        </View>
      ))}
    </View>
  </View>
);
