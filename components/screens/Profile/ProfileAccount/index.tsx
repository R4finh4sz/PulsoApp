import { type Href, router } from 'expo-router';
import {
  ChevronRight,
  CircleHelp,
  FileDown,
  FileText,
  LockKeyhole,
  ShieldCheck,
  Trash2,
} from 'lucide-react-native';
import { useState } from 'react';
import { Platform, Share, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';

import Pressable from '@/components/ui/Pressable';
import { shadow } from '@/global/shadow';
import { profileService } from '@/services/profile';
import { getErrorMessage } from '@/utils/getErrorMessage';

type AccountAction = {
  label: string;
  icon: typeof FileText;
} & ({ href: Href; onPress?: never } | { href?: never; onPress?: () => void });

const accountActions: AccountAction[] = [
  {
    label: 'Alterar senha',
    icon: LockKeyhole,
    href: '/(main)/ResetPassword',
  },
  { label: 'Exportação de dados', icon: FileDown },
  {
    label: 'Termos de uso',
    icon: FileText,
    onPress: () => router.push('/(main)/TermsOfUse'),
  },
  { label: 'FAQ', icon: CircleHelp, href: '/(main)/FAQ' },
  { label: 'Segurança', icon: ShieldCheck, href: '/(main)/Security' },
  {
    label: 'Exclusão de conta',
    icon: Trash2,
    href: '/(main)/RequestDeletedAccount',
  },
];

export const ProfileAccount = () => {
  const [exporting, setExporting] = useState(false);
  const exportData = async () => {
    if (exporting) {
      return;
    }
    setExporting(true);
    try {
      const data = JSON.stringify(await profileService.exportData(), null, 2);
      if (Platform.OS === 'web') {
        const url = URL.createObjectURL(
          new Blob([data], { type: 'application/json' }),
        );
        try {
          const link = document.createElement('a');
          link.href = url;
          link.download = 'pulso-dados.json';
          document.body.appendChild(link);
          link.click();
          link.remove();
        } finally {
          URL.revokeObjectURL(url);
        }
      } else {
        await Share.share({ title: 'Dados pessoais do Pulso', message: data });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: getErrorMessage(error, 'Não foi possível exportar seus dados.'),
      });
    } finally {
      setExporting(false);
    }
  };
  return (
    <View className="mt-9">
      <Text className="mb-3 font-poppins_bold text-sm text-[#4B5563]">
        Conta
      </Text>

      <View className="gap-4">
        {accountActions.map(({ label, icon: Icon, href, onPress }) => (
          <View
            key={label}
            className="rounded-[14px] bg-neutral-background"
            style={shadow.default}
          >
            <Pressable
              accessibilityLabel={label}
              accessibilityRole="button"
              accessibilityState={{
                disabled: Icon === FileDown && exporting,
                busy: Icon === FileDown && exporting,
              }}
              className="min-h-[52px] flex-row items-center gap-[13px] rounded-[14px] px-4 py-[15px]"
              disabled={Icon === FileDown && exporting}
              onPress={() => {
                if (Icon === FileDown) {
                  exportData();
                } else if (href) {
                  router.push(href);
                } else {
                  onPress?.();
                }
              }}
            >
              <Icon color="#4B5563" size={23} strokeWidth={1.7} />

              <Text className="flex-1 font-poppins_medium text-[13px] text-[#4B5563]">
                {Icon === FileDown && exporting ? 'Exportando...' : label}
              </Text>

              <ChevronRight color="#BFC5CB" size={20} strokeWidth={1.7} />
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
};
