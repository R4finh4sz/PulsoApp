export type TLoginUser = {
  id: number;
  documentId: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
  publishedAt?: Date;
};

export type TLoginResponse = {
  jwt?: string;
  accessToken?: string;
  token?: string;
  user?: TLoginUser;
  refreshToken?: string;
};

export type TUser = {
  id: number;
  documentId: string;
  name: string;
};

export type TLoginTwoFactorResponse = {
  data: {
    requiresTwoFactor: boolean;
    challengeId: string;
    expiresAt: string;
    rememberMe: boolean;
    user: {
      role: {
        id: number;
      };
    };
    accessToken?: string;
    token?: string;
    jwt?: string;
  };
  message: string;
};

export type TVerifyCodeResponse = {
  data: {
    accessToken?: string;
    token?: string;
    jwt?: string;
    user?: TLoginUser;
  };
  message?: string;
};
