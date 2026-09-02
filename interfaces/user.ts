import { IImage } from './attachment';

export interface ILoginResponse {
  jwt: string;
  user: IUser;
  refreshToken: string;
}

export interface IUser {
  id: number;
  documentId: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  observation?: string;
  image?: IImage;
}
