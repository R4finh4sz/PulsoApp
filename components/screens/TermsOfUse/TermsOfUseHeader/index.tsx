import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { BackButton } from '@/components/ui/BackButton';

export const TermsOfUseHeader = ({
  hideBack = false,
  title = 'Termos de uso',
}: {
  hideBack?: boolean;
  title?: string;
}) => (
  <View>
    {!hideBack && (
      <BackButton
        onPress={() =>
          router.canGoBack() ? router.back() : router.replace('/(main)/Home')
        }
      />
    )}

    <Text
      accessibilityRole="header"
      className="mb-8 mt-9 text-center font-poppins_bold text-xl text-[#253044]"
    >
      {title}
    </Text>
  </View>
);
