import { useLocalSearchParams } from 'expo-router';

import {
  ActivityFlow,
  RemoteActivity,
} from '@/components/screens/Quiz/ActivityFlow';
import { isMockEnabled } from '@/services/mock';

const ActivityScreen = () => {
  const { id, visit } = useLocalSearchParams<{ id: string; visit?: string }>();
  return isMockEnabled ? (
    <ActivityFlow key={`${id}-${visit}`} id={id} />
  ) : (
    <RemoteActivity key={`${id}-${visit}`} id={id} />
  );
};

export default ActivityScreen;
