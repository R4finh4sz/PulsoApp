import { Redirect } from 'expo-router';

import useAuth from '@/contexts/Auth/useAuth';

const Root = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return null;
  }
  return <Redirect href={user ? '/(main)/Home' : '/(auth)/Intro'} />;
};
export default Root;
