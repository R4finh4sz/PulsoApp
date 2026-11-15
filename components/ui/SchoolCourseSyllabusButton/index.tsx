import { router } from 'expo-router';
import { FileText } from 'lucide-react-native';
import { Text } from 'react-native';

import Pressable from '@/components/ui/Pressable';
import { SchoolCourse } from '@/services/classrooms';

export const SchoolCourseSyllabusButton = ({
  schoolCourse,
}: {
  schoolCourse: SchoolCourse;
}) => (
  <Pressable
    accessibilityLabel={`Ver ementa de ${schoolCourse.name}`}
    accessibilityRole="button"
    className="min-h-11 flex-row items-center justify-center gap-1.5 rounded-xl bg-[#E7FAFD] px-3"
    onPress={event => {
      event.stopPropagation();
      router.push({
        pathname: '/(main)/SchoolCourseSyllabus',
        params: {
          schoolCourseId: schoolCourse.id,
          classroomId: schoolCourse.classroomId,
        },
      });
    }}
  >
    <FileText color="#006D83" size={16} strokeWidth={1.7} />

    <Text className="font-poppins_medium text-xs text-[#006D83]">Ementa</Text>
  </Pressable>
);
