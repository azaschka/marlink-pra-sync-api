import { BusinessUnit, HypervisorType } from '../enums';

export class CreateNodeCommand {
    public readonly commandType = 'sm-create-node';

    constructor(
        public readonly transactionId: string,
        public readonly siteId: string,
        public readonly businessUnit: BusinessUnit,
        public readonly hypervisorId?: string,
        public readonly hypervisorType?: HypervisorType,
        public readonly vmId?: number,
    ) {}
}
