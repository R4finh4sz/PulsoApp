export const homeMock = {
  name: 'Rafael Souza',
  performance: 90,
  completed: 28,
  activities: [
    {
      id: '1',
      title: 'Funções do 2º grau',
      schoolCourse: 'Matemática',
      teacher: 'Prof. Carlos',
      daysLeft: 2,
      kind: 'math' as const,
    },
    {
      id: '2',
      title: 'Interpretação de texto',
      schoolCourse: 'Português',
      teacher: 'Prof. Marina',
      daysLeft: 5,
      kind: 'reading' as const,
    },
    {
      id: '3',
      title: 'Interpretação de texto',
      schoolCourse: 'Português',
      teacher: 'Prof. Marina',
      daysLeft: 19,
      kind: 'reading' as const,
    },
    {
      id: '4',
      title: 'Equações do 1º grau',
      schoolCourse: 'Matemática',
      teacher: 'Prof. Carlos',
      daysLeft: 21,
      kind: 'math' as const,
    },
  ],
};

export type HomeActivity = (typeof homeMock.activities)[number];
