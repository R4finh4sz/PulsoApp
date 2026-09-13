import { BookOpen } from 'lucide-react-native';
import { Text, View } from 'react-native';

import type { Subject } from '@/services/classrooms';

export const TeamsSubjectCard = ({ subject }: { subject: Subject }) => (
  <View
    style={{
      backgroundColor: '#E6FBFF',
      padding: 16,
      borderRadius: 20,
      gap: 12,
    }}
  >
    <BookOpen color="#0095B3" size={24} />

    <Text
      className="font-poppins_medium"
      style={{ fontSize: 15, color: '#253044' }}
    >
      {subject.name}
    </Text>

    <Text className="font-poppins text-xs" style={{ color: '#64748B' }}>
      Nenhuma atividade disponível.
    </Text>
  </View>
);
