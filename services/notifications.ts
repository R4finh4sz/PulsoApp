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
      ? [
          {
            id: 1,
            type: 'SUBJECT_INVITATION',
            title: 'Nova atividade disponível',
            message:
              'Uma nova atividade de Matemática está disponível. Acesse Minhas atividades para responder.',
            read: false,
            readAt: null,
            createdAt: '2026-11-05T12:00:00Z',
            readUrl: '/notifications/1/read',
          },
        ]
      : (await api.get<StudentNotification[]>('/notifications', { signal }))
          .data,
  markRead: async (id: number) => {
    if (isMockEnabled) return;
    await api.patch(`/notifications/${id}/read`);
  },
};
