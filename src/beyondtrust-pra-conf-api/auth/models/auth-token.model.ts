export interface AuthToken {
    type: string;
    expirationDate: Date;
    accessToken: string;
}
