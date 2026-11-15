import { useLocalSearchParams } from 'expo-router';

import { ActivitiesScreen } from '@/components/screens/Quiz/ActivitiesScreen';

const QuizScreen = () => {
  const { filter } = useLocalSearchParams<{ filter?: string }>();
  return <ActivitiesScreen initialCompleted={filter === 'completed'} />;
};

export default QuizScreen;
