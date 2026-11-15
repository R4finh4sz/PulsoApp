import { useLocalSearchParams } from 'expo-router';

import { ActivitiesScreen } from '@/components/screens/Quiz/ActivitiesScreen';

const SchoolCourseActivitiesScreen = () => {
  const { schoolCourseId, schoolCourseName, classroomId } =
    useLocalSearchParams<{
      schoolCourseId: string;
      schoolCourseName: string;
      classroomId: string;
    }>();
  return (
    <ActivitiesScreen
      key={`${classroomId}-${schoolCourseId}`}
      classroomId={Number(classroomId)}
      schoolCourseId={Number(schoolCourseId)}
      schoolCourseName={schoolCourseName}
    />
  );
};

export default SchoolCourseActivitiesScreen;
