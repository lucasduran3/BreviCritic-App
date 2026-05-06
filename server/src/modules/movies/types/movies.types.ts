export interface Movie {
  id: number;
  title: string;
  overview: string;
  posterPath: string | null;
  genres: { id: number; name: string }[];
  releaseDate: Date | null;
  fetchedAt: Date;
}
