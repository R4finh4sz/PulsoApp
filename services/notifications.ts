import api from '@/services/api';
import { isMockEnabled } from '@/services/mock';

export type StudentNotification = {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  readAt: string | null;
  createdAt: string;
  readUrl: string;
};

export const notificationService = {
  list: async (signal?: AbortSignal): Promise<StudentNotification[]> =>
    isMockEnabled
      ? []
      : (await api.get<StudentNotification[]>('/notifications', { signal }))
          .data,
  markRead: async (id: number) => {
    if (isMockEnabled) return;
    await api.patch(`/notifications/${id}/read`);
  },
};
