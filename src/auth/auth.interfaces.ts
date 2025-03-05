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
