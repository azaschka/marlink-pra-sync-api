import { JumpGroupType } from '../enums/jump-group-type.enum';

export class RetrieveWebJumpsQuery {
    public readonly queryType = 'bt-retrieve-web-jumps';

    constructor(
        public readonly transactionId: string,
        public readonly pageSize: number,
        public readonly pageNumber: number,
        public readonly name?: string,
        public readonly url?: string,
        public readonly jumpGroupId?: number,
        public readonly jumpGroupType?: JumpGroupType,
        public readonly jumpointId?: number,
        public readonly tag?: string,
    ) {}
}
