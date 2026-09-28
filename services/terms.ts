import api from '@/services/api';
import { isMockEnabled, mockTerms } from '@/services/mock';

export type Terms = { title: string; version: string; content: string };
const mockAcceptedVersions = new Set<string>([mockTerms.version]);

export const termsService = {
  current: async () =>
    isMockEnabled ? mockTerms : (await api.get<Terms>('/terms')).data,
  accepted: async () =>
    isMockEnabled
      ? Array.from(mockAcceptedVersions)
      : (await api.get<string[]>('/terms/accepted')).data,
  accept: async (version: string) => {
    if (isMockEnabled) {
      mockAcceptedVersions.add(version);
      return;
    }
    await api.post('/terms/accept', { version, termsAccepted: true });
  },
};
