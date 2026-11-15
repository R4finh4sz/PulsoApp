import api from '@/services/api';
import { isMockEnabled, mockTerms } from '@/services/mock';
import { requiresGuardian } from '@/validation/Register.validation';

export type Terms = { title: string; version: string; content: string };
const mockAcceptedVersions = new Set<string>([mockTerms.version]);

export const usesStudentTerm = (birthDate?: string | null) =>
  !birthDate || requiresGuardian(birthDate.split('-').reverse().join('/'));

export const termsService = {
  current: async (studentTerm = true) =>
    isMockEnabled
      ? mockTerms
      : (await api.get<Terms>(studentTerm ? '/student-term' : '/terms')).data,
  privacy: async (): Promise<Terms> =>
    isMockEnabled
      ? { ...mockTerms, title: 'Política de Privacidade' }
      : (await api.get<Terms>('/privacy-policy')).data,
  accepted: async () =>
    isMockEnabled
      ? Array.from(mockAcceptedVersions)
      : (await api.get<string[]>('/terms/accepted')).data,
  accept: async (version: string, privacyVersion: string) => {
    if (isMockEnabled) {
      mockAcceptedVersions.add(version);
      return;
    }
    await api.post('/terms/accept', {
      version,
      termsAccepted: true,
      privacyAccepted: true,
      privacyVersion,
    });
  },
};
