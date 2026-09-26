import api from '@/services/api';

export type Terms = { title: string; version: string; content: string };
export const termsService = {
  current: async () => (await api.get<Terms>('/terms')).data,
  accepted: async () => (await api.get<string[]>('/terms/accepted')).data,
  accept: async (version: string) => {
    await api.post('/terms/accept', { version, termsAccepted: true });
  },
};
