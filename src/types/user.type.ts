export type User = {
    id: string;
    email: string;
    emailConfirmedAt: string;
    metadata: UserMetadata;
}

export type UserMetadata = {
    [key: string]: any;
};