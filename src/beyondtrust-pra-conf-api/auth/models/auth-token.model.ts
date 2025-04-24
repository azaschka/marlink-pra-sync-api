export interface AuthToken {
    type: string;
    expiresInSeconds: number;
    accessToken: string;
}
