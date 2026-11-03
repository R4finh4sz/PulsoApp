import { router } from 'expo-router';
import { BookOpen } from 'lucide-react-native';
import { Text } from 'react-native';

import Pressable from '@/components/ui/Pressable';
import type { SchoolCourse } from '@/services/classrooms';

export const TeamsSchoolCourseCard = ({
  schoolCourse,
}: {
  schoolCourse: SchoolCourse;
}) => (
  <Pressable
    accessibilityLabel={`Ver atividades de ${schoolCourse.name}`}
    accessibilityRole="button"
    style={{
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#CBD5E1',
      padding: 16,
      borderRadius: 20,
      gap: 12,
    }}
    onPress={() =>
      router.push({
        pathname: '/(main)/SchoolCourseActivities',
        params: {
          schoolCourseId: schoolCourse.id,
          schoolCourseName: schoolCourse.name,
          classroomId: schoolCourse.classroomId,
        },
      })
    }
  >
    <BookOpen color="#006D83" size={24} />

    <Text
      className="font-poppins_medium"
      style={{ fontSize: 15, color: '#253044' }}
    >
      {schoolCourse.name}
    </Text>

    <Text className="font-poppins text-xs" style={{ color: '#455165' }}>
      Ver atividades
    </Text>
  </Pressable>
);
