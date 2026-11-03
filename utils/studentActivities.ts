import { StudentActivity } from '@/services/activities';

export const isPendingStudentActivity = ({
  activity,
  submission,
}: StudentActivity) => activity.status === 'OPEN' && !submission;

export const summarizeActivities = (activities: StudentActivity[]) => {
  const submissions = activities.flatMap(item =>
    item.submission ? [item.submission] : [],
  );
  const graded = submissions.filter(
    item => item.gradedAt && item.score !== null,
  );
  return {
    completed: submissions.length,
    pending: activities.filter(isPendingStudentActivity).length,
    graded: graded.length,
    percentage: graded.length
      ? Math.round(
          graded.reduce((sum, item) => sum + Number(item.score), 0) /
            graded.length,
        )
      : 0,
  };
};
