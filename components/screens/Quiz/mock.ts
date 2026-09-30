export type QuizActivity = {
  id: string;
  classroomId: number;
  schoolCourseId: number;
  schoolCourse: string;
  teacher: string;
  title: string;
  questions: number;
  completed: boolean;
  daysLeft: number;
  kind: 'math' | 'reading' | 'science';
};

// Dados de demonstração; substituir pela consulta quando a API estiver disponível.
export const quizMock: QuizActivity[] = [
  {
    id: '1',
    classroomId: 1,
    schoolCourseId: 1,
    schoolCourse: 'Matemática',
    teacher: 'Carlos Mendes',
    title: 'Funções do 2º grau',
    questions: 10,
    completed: false,
    daysLeft: 0,
    kind: 'math',
  },
  {
    id: '2',
    classroomId: 1,
    schoolCourseId: 1,
    schoolCourse: 'Matemática',
    teacher: 'Carlos Mendes',
    title: 'Geometria',
    questions: 10,
    completed: false,
    daysLeft: 2,
    kind: 'math',
  },
  {
    id: '3',
    classroomId: 1,
    schoolCourseId: 1,
    schoolCourse: 'Matemática',
    teacher: 'Carlos Mendes',
    title: 'Equação linear',
    questions: 10,
    completed: false,
    daysLeft: 5,
    kind: 'math',
  },
  {
    id: '4',
    classroomId: 1,
    schoolCourseId: 1,
    schoolCourse: 'Matemática',
    teacher: 'Carlos Mendes',
    title: 'Funções do 1º grau',
    questions: 10,
    completed: false,
    daysLeft: 0,
    kind: 'math',
  },
  {
    id: '5',
    classroomId: 1,
    schoolCourseId: 2,
    schoolCourse: 'Português',
    teacher: 'Marina Lopes',
    title: 'Interpretação de texto',
    questions: 8,
    completed: false,
    daysLeft: 2,
    kind: 'reading',
  },
  {
    id: '6',
    classroomId: 1,
    schoolCourseId: 3,
    schoolCourse: 'Química',
    teacher: 'Rafael Costa',
    title: 'Ligações químicas',
    questions: 6,
    completed: false,
    daysLeft: -1,
    kind: 'science',
  },
  ...[
    'Funções do 2º grau',
    'Geometria',
    'Equação linear',
    'Funções do 1º grau',
  ].map((title, index): QuizActivity => ({
    id: `completed-${index}`,
    classroomId: 1,
    schoolCourseId: 1,
    schoolCourse: 'Matemática',
    teacher: 'Carlos Mendes',
    title,
    questions: 10,
    completed: true,
    daysLeft: 0,
    kind: 'math',
  })),
];
