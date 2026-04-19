export class DownloadNodeIsoCommand {
    public readonly commandType = 'sm-download-node-iso';

    constructor(
        public readonly transactionId: string,
        public readonly certname: string,
    ) {}
}
