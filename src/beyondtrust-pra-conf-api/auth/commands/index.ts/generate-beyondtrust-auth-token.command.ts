export class GenerateBeyondtrustAuthTokenCommand {
    public readonly commandType = 'generate-beyondtrust-auth-token';

    constructor(public readonly transactionId: string) {}
}
