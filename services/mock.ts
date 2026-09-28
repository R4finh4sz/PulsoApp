import { TUser } from '@/interfaces/user';

import type { Classroom, Subject } from './classrooms';

export const isMockEnabled = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

export const mockTerms = {
  title: 'Termos de Uso e Política de Privacidade — demonstração',
  version: 'demo',
  content:
    'Estes termos são demonstrativos, usados para testar a leitura e o aceite no aplicativo.\n\n' +
    '1. Cadastro\nNo modo de demonstração, nenhuma conta é criada ou enviada para aprovação.\n\n' +
    '2. Privacidade\nOs dados do cadastro e a foto não são enviados ao servidor nesse modo. A consulta de CEP continua sendo realizada no ViaCEP.\n\n' +
    '3. Aceite\nO aceite é simulado localmente e não representa a aceitação dos documentos definitivos.\n\n' +
    'Na versão conectada, os Termos de Uso e a Política de Privacidade serão carregados do servidor para leitura e aceite.',
};

export const mockUser: TUser = {
  id: 1,
  fullName: 'Rafael Souza',
  ra: '20250001',
  email: 'rafael@pulso.app',
  role: 'STUDENT',
  classroomId: 1,
};

export const mockClassrooms: Classroom[] = [
  {
    id: 1,
    name: '3º Ano B',
    identifier: '3B',
    teacherIds: [10, 11, 12],
  },
];

export const mockSubjects: Subject[] = [
  { id: 1, name: 'Matemática', classroomId: 1, teacherId: 10 },
  { id: 2, name: 'Português', classroomId: 1, teacherId: 11 },
  { id: 3, name: 'Química', classroomId: 1, teacherId: 12 },
];
