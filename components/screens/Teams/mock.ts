export type TeamSubject = {
  id: string;
  title: string;
  teacher: string;
  activityCount: number;
  kind: 'math' | 'reading' | 'science';
};

export const teamsMock: { subjects: TeamSubject[] } = {
  subjects: [
    {
      id: '1',
      title: '3º Ano B - Matemática',
      teacher: 'Prof. Carlos Mendes',
      activityCount: 6,
      kind: 'math',
    },
    {
      id: '2',
      title: '3º Ano B - Português',
      teacher: 'Prof. Marina Lopes',
      activityCount: 4,
      kind: 'reading',
    },
    {
      id: '3',
      title: '3º Ano B - Química',
      teacher: 'Prof. Rafael Costa',
      activityCount: 2,
      kind: 'science',
    },
    {
      id: '4',
      title: '3º Ano B - Eletiva',
      teacher: 'Prof. Biel',
      activityCount: 2,
      kind: 'science',
    },
  ],
};
