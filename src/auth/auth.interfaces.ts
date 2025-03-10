export interface JwtPayload {
  apiId: string;
  id: string;
  accessToken: string;
  refreshToken: string;
  email: string;
  roles: string[];
  fullName: string;
  picUrl: string;
}

export const NullPayload: JwtPayload = {
  apiId: '',
  id: '',
  accessToken: '',
  refreshToken: '',
  email: '',
  roles: [],
  fullName: '',
  picUrl: '',
};

export interface OtpCreateResponse {
  status: boolean;
  message: string;
  data?: {
    deviceId?: string;
    preAuthSessionId?: string;
    user?: {
      id: string;
      email: string;
      // Add other user properties as needed
    };
    accessToken?: string;
    refreshToken?: string;
  };
}

export interface OtpVerifyApiResponse {
  status: number; // Changed to number to match the example
  message: string;
  data?: {
    accessToken: string;
    refreshToken: string;
    user: {
      signup: boolean;
      id: string;
      email: string;
      roles: string[]; // Assuming roles is an array of strings
      fullName: string;
      picture: {
        id: string;
        url: string;
        width: number;
        height: number;
      };
    };
  };
}

export interface HttpError {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
}
