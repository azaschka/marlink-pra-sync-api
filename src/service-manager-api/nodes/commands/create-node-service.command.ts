import { NodeServiceType } from '../enums';

export class CreateNodeServiceCommand {
    public readonly commandType = 'sm-create-node-service';

    constructor(
        public readonly transactionId: string,
        public readonly certname: string,
        public readonly serviceType: NodeServiceType,
    ) {}
}
