import { router } from 'expo-router';
import { PropsWithChildren } from 'react';
import { Text, View } from 'react-native';

import { BackButton } from '@/components/ui/BackButton';

export const TermsOfUseHeader = ({
  hideBack = false,
  title = 'Termos de uso',
  children,
}: PropsWithChildren<{
  hideBack?: boolean;
  title?: string;
}>) => (
  <View>
    {!hideBack && (
      <BackButton
        onPress={() =>
          router.canGoBack() ? router.back() : router.replace('/(main)/Home')
        }
      />
    )}

    {children && <View className="mt-4">{children}</View>}

    <Text
      accessibilityRole="header"
      className="mb-8 mt-9 text-center font-poppins_bold text-xl text-[#253044]"
    >
      {title}
    </Text>
  </View>
);
