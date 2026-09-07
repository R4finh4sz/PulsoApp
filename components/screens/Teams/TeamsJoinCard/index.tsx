import { ChevronRight, Plus } from 'lucide-react-native';
import { Text, View } from 'react-native';

import Pressable from '@/components/ui/Pressable';

type Props = { onJoin?: () => void };

export const TeamsJoinCard = ({ onJoin }: Props) => (
  <Pressable
    accessibilityLabel="Ingressar em turma. Use o código de convite do professor"
    accessibilityRole="button"
    accessibilityState={{ disabled: !onJoin }}
    disabled={!onJoin}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: '#00A0C4',
      borderRadius: 18,
      backgroundColor: '#E6FBFF',
    }}
    onPress={onJoin}
  >
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#0095B3',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Plus color="#FFFFFF" size={24} strokeWidth={2} />
    </View>

    <View style={{ flex: 1 }}>
      <Text
        className="font-poppins_medium"
        style={{ fontSize: 14, color: '#007D9F' }}
      >
        Ingressar em turma
      </Text>

      <Text
        className="font-poppins"
        style={{ fontSize: 11, color: '#009DBD', marginTop: 2 }}
      >
        Use o código de convite do professor
      </Text>
    </View>

    <ChevronRight color="#0095B3" size={20} strokeWidth={1.8} />
  </Pressable>
);
