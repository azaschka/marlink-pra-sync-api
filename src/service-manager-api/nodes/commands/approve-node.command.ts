export class ApproveNodeCommand {
    public readonly commandType = 'sm-approve-node';

    constructor(
        public readonly transactionId: string,
        public readonly certname: string,
    ) {}
}
