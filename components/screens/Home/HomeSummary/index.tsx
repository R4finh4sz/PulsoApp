import { CircleCheck, Clock3 } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { shadow } from '@/global/shadow';

type Props = { pending: number; completed: number };

export const HomeSummary = ({ pending, completed }: Props) => (
  <View
    style={{ flexDirection: 'row', gap: 14, marginTop: 44, marginBottom: 36 }}
  >
    {[
      {
        label: 'Pendentes',
        value: pending,
        icon: Clock3,
        color: '#FFA600',
        background: '#FFF3C8',
      },
      {
        label: 'Concluídas',
        value: completed,
        icon: CircleCheck,
        color: '#00C853',
        background: '#D9FCE7',
      },
    ].map(item => (
      <View
        key={item.label}
        style={{
          flex: 1,
          padding: 16,
          borderRadius: 20,
          backgroundColor: '#F5F5F5',
          borderWidth: 1,
          borderColor: '#E7E7E7',
          ...shadow.medium,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 14,
            backgroundColor: item.background,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <item.icon color={item.color} size={20} strokeWidth={1.6} />
        </View>

        <Text
          className="font-poppins_bold text-2xl"
          style={{ color: '#253044', marginTop: 10 }}
        >
          {item.value}
        </Text>

        <Text
          className="font-poppins text-xs"
          style={{ color: '#607695', marginTop: 7 }}
        >
          {item.label}
        </Text>
      </View>
    ))}
  </View>
);
