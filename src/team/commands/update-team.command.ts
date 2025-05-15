export class UpdateTeamCommand {
    public readonly commandType = 'update-team';

    constructor(
        public readonly transactionId: string,
        public readonly id: number,
        public readonly name: string,
        public readonly codeName?: string,
        public readonly comments?: string | null,
    ) {}
}
