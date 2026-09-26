import { Redirect, Tabs } from 'expo-router';

import { TermsGate } from '@/components/screens/TermsOfUse/TermsGate';
import { useAuth } from '@/contexts/Auth/useAuth';

const MainLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Redirect href="/(auth)/Login" />;
  }

  return (
    <TermsGate>
      <Tabs
        backBehavior="history"
        initialRouteName="Home/index"
        screenOptions={{ headerShown: false }}
        tabBar={() => null}
      >
        <Tabs.Screen name="Home/index" options={{ title: 'Início' }} />

        <Tabs.Screen name="Quiz/index" options={{ title: 'Quiz' }} />

        <Tabs.Screen name="Reports/index" options={{ title: 'Relatórios' }} />

        <Tabs.Screen name="Teams/index" options={{ title: 'Equipes' }} />

        <Tabs.Screen
          name="TermsOfUse/index"
          options={{ title: 'Termos de uso', href: null }}
        />

        <Tabs.Screen
          name="Profile/index"
          options={{ title: 'Perfil', href: null }}
        />
      </Tabs>
    </TermsGate>
  );
};

export default MainLayout;
