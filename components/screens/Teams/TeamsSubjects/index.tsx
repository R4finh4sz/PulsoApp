import { View } from 'react-native';

import type { TeamSubject } from '@/components/screens/Teams/mock';
import { TeamsSubjectCard } from '@/components/screens/Teams/TeamsSubjectCard';

type Props = { subjects: TeamSubject[] };

export const TeamsSubjects = ({ subjects }: Props) => (
  <View style={{ gap: 14 }}>
    {subjects.map(subject => (
      <TeamsSubjectCard key={subject.id} subject={subject} />
    ))}
  </View>
);
