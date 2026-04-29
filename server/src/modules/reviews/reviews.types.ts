export interface Review {
  id: string;
  userId: string;
  movieId: number;
  content: string;
  score: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateReviewDTO {
  movieId: number;
  content: string;
  score: number;
}

export interface UpdateReviewDTO {
  content?: string;
  score?: number;
}

// Review con datos de TMDB
export interface ReviewFeedItem extends Review {
  //movieTitle
  //moviePoster
}

export interface ReviewFilters {
  limit: number;
  offset: number;
}
