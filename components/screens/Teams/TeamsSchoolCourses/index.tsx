import { View } from 'react-native';

import { TeamsSchoolCourseCard } from '@/components/screens/Teams/TeamsSchoolCourseCard';
import type { SchoolCourse } from '@/services/classrooms';

export const TeamsSchoolCourses = ({
  schoolCourses,
}: {
  schoolCourses: SchoolCourse[];
}) => (
  <View style={{ gap: 14 }}>
    {schoolCourses.map(schoolCourse => (
      <TeamsSchoolCourseCard
        key={schoolCourse.id}
        schoolCourse={schoolCourse}
      />
    ))}
  </View>
);
