export interface Picture {
  id: string;
  createdAt: string;
  url: string;
  provider: string;
  publicId: string;
  width: number;
  height: number;
}

export interface User {
  id: string;
  email: string;
  userId: string;
  fullName: string | null;
  picture: Picture | null;
  phoneNumber: string;
  gender: 'male' | 'female';
  dateOfBirth: string | null;
  province: string;
  city: string;
}

export interface CircleProfile {
  id: string | null;
  name: string | null;
  picture: string | null;
  banner: string | null;
}

export interface UserResponseData {
  user: User;
  circleProfile: CircleProfile;
  roles: string[];
}

export interface UserMeResponse {
  status: boolean;
  message: string;
  data: UserResponseData;
}
