import { Check } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { passwordRequirements } from '@/validation/ForgotPassword.validation';

type Props = { password: string };

export const PasswordRequirements = ({ password }: Props) => (
  <View className="gap-3 rounded-2xl border border-[#0095B3] bg-[#E7FAFD] p-4">
    <Text className="font-poppins_medium text-xs text-[#253041]">
      Sua senha deve conter:
    </Text>

    {passwordRequirements.map(requirement => {
      const satisfied = requirement.validate(password);
      return (
        <View
          key={requirement.id}
          accessibilityLabel={`${requirement.label}: ${satisfied ? 'atendido' : 'pendente'}`}
          className="flex-row items-center gap-3"
        >
          <View
            className={`h-3.5 w-3.5 items-center justify-center rounded-full ${satisfied ? 'bg-[#18C65B]' : 'border border-[#C7D5DF]'}`}
          >
            {satisfied && <Check color="#FFFFFF" size={10} strokeWidth={3} />}
          </View>

          <Text
            className={`font-poppins text-xs ${satisfied ? 'text-[#18C65B]' : 'text-[#94A3B8]'}`}
          >
            {requirement.label}
          </Text>
        </View>
      );
    })}
  </View>
);
