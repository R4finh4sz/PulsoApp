import api from '@/services/api';

export type Faq = {
  id: number;
  title: string;
  targetRole: 'STUDENT' | 'TEACHER' | 'PEDAGOGICAL_COORDINATOR';
  message: string;
};

export const faqService = {
  list: async (signal?: AbortSignal): Promise<Faq[]> =>
    (await api.get<Faq[]>('/faqs', { signal })).data,
};
