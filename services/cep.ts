import axios from 'axios';

export interface IViaCep {
  erro?: boolean | string;
  cep: string;
  logradouro: string;
  complemento: string;
  unidade: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

export const getAdressByZipCode = async (zipCode?: string | null) => {
  if (!zipCode) {
    throw new Error('CEP não informado');
  }

  const normalizedZipCode = zipCode.replace(/\D/g, '');

  if (normalizedZipCode.length !== 8) {
    throw new Error('CEP inválido');
  }

  const { data } = await axios.get<IViaCep>(
    `https://viacep.com.br/ws/${normalizedZipCode}/json/`,
    { timeout: 10000 },
  );

  if (data.erro || !data.localidade || !data.uf) {
    throw new Error('CEP não encontrado. Verifique os números informados.');
  }
  return data;
};
