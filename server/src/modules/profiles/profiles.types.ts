export interface Profile {
  id: string;
  username: string;
  name: string;
  lastname: string;
  country: string;
  city: string;
  profilePhotoUrl: string | null;
  isPublic: boolean;
  createdAt: Date;
}

export interface PublicProfile {
  username: string;
  name: string;
  lastname: string;
  profilePhotoUrl: string | null;
  country: string;
  city: string;
  isPublic: boolean;
  createdAt: Date;
}

export interface ProfileSearchResult {
  id: string;
  username: string;
  profilePhotoUrl: string | null;
}

export interface UpdateProfileDTO {
  username?: string;
  name?: string;
  lastname?: string;
  country?: string;
  city?: string;
  profilePhotoUrl?: string | null;
  isPublic?: boolean;
}

export interface ProfileSearchFilters {
  search?: string; // Para busqueda por nombre, apellido o username
  limit: number;
  offset: number; // Para paginacion
}
