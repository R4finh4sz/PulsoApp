import axios from 'axios';

import api from '@/services/api';
import { getAdressByZipCode } from '@/services/cep';
import { classroomService } from '@/services/classrooms';

jest.mock('@/services/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));
jest.mock('@/services/mock', () => ({ isMockEnabled: false }));

afterEach(() => jest.restoreAllMocks());

it('consulta turmas e matérias da turma selecionada', async () => {
  jest
    .mocked(api.get)
    .mockResolvedValueOnce({ data: [{ id: 1 }] })
    .mockResolvedValueOnce({ data: [{ id: 2, classroomId: 1 }] });
  await expect(classroomService.list()).resolves.toEqual([{ id: 1 }]);
  await expect(classroomService.schoolCourses(1)).resolves.toEqual([
    { id: 2, classroomId: 1 },
  ]);
  expect(api.get).toHaveBeenCalledWith('/classrooms');
  expect(api.get).toHaveBeenCalledWith('/classrooms/1/subjects');
});

it.each([undefined, null, '', '123'])(
  'rejeita CEP inválido sem chamar o ViaCEP: %s',
  async cep => {
    const get = jest.spyOn(axios, 'get');
    await expect(getAdressByZipCode(cep)).rejects.toThrow(/CEP/);
    expect(get).not.toHaveBeenCalled();
  },
);

it('consulta o CEP sem máscara com timeout', async () => {
  const address = { cep: '01001-000', localidade: 'São Paulo', uf: 'SP' };
  const get = jest.spyOn(axios, 'get').mockResolvedValue({ data: address });
  await expect(getAdressByZipCode('01001-000')).resolves.toBe(address);
  expect(get).toHaveBeenCalledWith('https://viacep.com.br/ws/01001000/json/', {
    timeout: 10000,
  });
});

it.each([{ erro: true }, { localidade: 'São Paulo' }, { uf: 'SP' }])(
  'rejeita resposta incompleta do ViaCEP (%#)',
  async data => {
    jest.spyOn(axios, 'get').mockResolvedValue({ data });
    await expect(getAdressByZipCode('01001000')).rejects.toThrow(
      'CEP não encontrado',
    );
  },
);

it('propaga falha de rede na consulta de CEP', async () => {
  const failure = new Error('Timeout');
  jest.spyOn(axios, 'get').mockRejectedValue(failure);
  await expect(getAdressByZipCode('01001000')).rejects.toBe(failure);
});
