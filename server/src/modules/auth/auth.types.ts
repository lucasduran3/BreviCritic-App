export interface RegisterDTO {
  username: string;
  email: string;
  password_hash: string;
  name: string;
  lastname: string;
  country: string;
  city: string;
  profilePhotoUrl?: string;
  isPublic: boolean;
}

export interface LoginDTO {
  identifier: string; // email o username
  password_hash: string;
}

export interface JWTPayload {
    sub: string;
    iat?: number;
    exp?: number;
}
