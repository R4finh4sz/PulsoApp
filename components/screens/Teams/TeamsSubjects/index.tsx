import { View } from 'react-native';

import { TeamsSubjectCard } from '@/components/screens/Teams/TeamsSubjectCard';
import type { Subject } from '@/services/classrooms';

export const TeamsSubjects = ({ subjects }: { subjects: Subject[] }) => (
  <View style={{ gap: 14 }}>
    {subjects.map(subject => (
      <TeamsSubjectCard key={subject.id} subject={subject} />
    ))}
  </View>
);
