export interface Suggestion {
    id: string;
    userId: string;
    userEmail: string | null;
    userName: string | null;
    category: string;
    title: string;
    content: string;
    likesCount: number;
    createdAt: string;
    userHasLiked: boolean;
}

export interface LikeSuggestionResponse {
    liked: boolean;
    likesCount: number;
}