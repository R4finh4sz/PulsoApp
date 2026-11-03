import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useFocusEffect } from 'expo-router';
import { Bell, BookOpen, GraduationCap } from 'lucide-react-native';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Pressable from '@/components/ui/Pressable';
import useAuth from '@/contexts/Auth/useAuth';
import {
  notificationService,
  StudentNotification,
} from '@/services/notifications';
import { getErrorMessage } from '@/utils/getErrorMessage';

const NotificationsScreen = () => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const client = useQueryClient();
  const queryKey = ['student-notifications', user?.id];
  const query = useQuery({
    queryKey,
    enabled: !!user,
    queryFn: ({ signal }) => notificationService.list(signal),
  });
  const { refetch } = query;
  useFocusEffect(
    useCallback(() => {
      if (user) refetch({ cancelRefetch: false });
    }, [user, refetch]),
  );
  const read = useMutation({
    mutationFn: (id: number) => notificationService.markRead(id),
    onSuccess: (_, id) => {
      client.setQueryData<StudentNotification[]>(queryKey, items =>
        items?.map(item => (item.id === id ? { ...item, read: true } : item)),
      );
    },
  });

  return (
    <View className="flex-1 bg-neutral-background">
      <ScrollView
        alwaysBounceVertical
        contentContainerClassName="grow px-6"
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 32,
        }}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching}
            onRefresh={() => {
              query.refetch();
            }}
            tintColor="#006D83"
            colors={['#006D83']}
          />
        }
      >
        <View className="w-full max-w-[560px] self-center">
          <View className="mb-8 flex-row items-center gap-4">
            <BackButton
              label=""
              onPress={() =>
                router.canGoBack()
                  ? router.back()
                  : router.replace('/(main)/Home')
              }
            />
            <Text
              accessibilityRole="header"
              className="flex-1 font-poppins_bold text-xl text-[#253044]"
            >
              Notificações
            </Text>
          </View>
          {query.isPending && (
            <ActivityIndicator
              accessibilityLabel="Carregando notificações"
              color="#006D83"
            />
          )}
          {query.isError && (
            <View className="mb-5 gap-3">
              <Text
                accessibilityRole="alert"
                className="font-poppins text-sm text-[#455165]"
              >
                Não foi possível carregar suas notificações.
              </Text>
              <Button
                accessibilityRole="button"
                text="Tentar novamente"
                onPress={() => {
                  query.refetch();
                }}
              />
            </View>
          )}
          {read.isError && (
            <Text
              accessibilityRole="alert"
              className="mb-4 font-poppins text-sm text-alert-error-primary"
            >
              {getErrorMessage(
                read.error,
                'Não foi possível marcar como lida. Tente novamente.',
              )}
            </Text>
          )}
          {!query.isPending && !query.isError && !query.data?.length && (
            <View className="items-center gap-4 py-12">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-[#F3EDFF]">
                <Bell color="#7440BF" size={28} />
              </View>
              <Text className="text-center font-poppins_semibold text-base text-[#253044]">
                Nenhuma notificação por enquanto
              </Text>
              <Text className="text-center font-poppins text-sm text-[#455165]">
                Seus avisos e novidades aparecerão aqui.
              </Text>
            </View>
          )}
          <View className="gap-3">
            {query.data?.map(item => {
              const Icon =
                item.type === 'SUBJECT_INVITATION'
                  ? BookOpen
                  : item.type === 'SCHOOL_INVITATION'
                    ? GraduationCap
                    : Bell;
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.title}. ${item.message}. ${item.read ? 'Lida' : 'Não lida. Toque para marcar como lida'}`}
                  disabled={item.read || read.isPending}
                  className="flex-row items-start gap-3 rounded-[20px] border border-[#CBD5E1] bg-white p-4"
                  onPress={() => read.mutate(item.id)}
                >
                  <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#F3EDFF]">
                    <Icon color="#7440BF" size={22} strokeWidth={1.6} />
                  </View>
                  <View className="flex-1 gap-1">
                    <Text
                      className={`${item.read ? 'font-poppins_medium' : 'font-poppins_semibold'} text-sm text-[#253044]`}
                    >
                      {item.title}
                    </Text>
                    <Text className="font-poppins text-xs leading-5 text-[#455165]">
                      {item.message}
                    </Text>
                    {!item.read && (
                      <Text className="font-poppins_semibold text-[11px] text-[#006D83]">
                        Não lida
                      </Text>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default NotificationsScreen;
