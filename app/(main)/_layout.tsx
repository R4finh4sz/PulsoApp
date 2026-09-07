import { Redirect, Slot } from 'expo-router';

import { useAuth } from '@/contexts/Auth/useAuth';

const MainLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Redirect href="/(auth)/Login" />;
  }

  return <Slot />;
};

export default MainLayout;
