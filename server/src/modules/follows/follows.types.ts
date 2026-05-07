export interface Follow {
  followerId: string;
  followedId: string;
  createdAt: Date;
}

export interface FollowListItem {
  username: string;
  profilePhotoUrl: string | null;
}
