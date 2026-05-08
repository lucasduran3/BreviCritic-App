export type ReactionType = 'like' | 'dislike';

export interface UpsertReactionDTO {
    type: ReactionType;
}

export interface ReactionResult {
    reviewId: string;
    type: ReactionType;
    likes: number;
    dislikes: number;
}