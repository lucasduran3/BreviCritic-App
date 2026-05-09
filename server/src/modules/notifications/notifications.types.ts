export interface NotificationItem {
  id: string;
  type: 'follow' | 'like';
  isRead: boolean;
  createdAt: Date;
  actor: {
    username: string;
    profilePhotoUrl: string | null;
  };
  review?: {
    id: string;
    movieTitle: string;
  };
}

export interface NotificationFilters {
  limit: number;
  offset: number;
  isRead?: boolean;
}
