import { JumpClientEndpointAgreementPolicyType, JumpClientGroupType } from '../enums';

export class ModifyJumpClientCommand {
    public readonly commandType = 'bt-modify-jump-client';

    constructor(
        public readonly transactionId: string,
        public readonly id: number,
        public readonly jumpGroupId?: number,
        public readonly jumpGroupType?: JumpClientGroupType,
        public readonly name?: string,
        public readonly tag?: string,
        public readonly comments?: string,
        public readonly jumpPolicyId?: number | null,
        public readonly sessionPolicyId?: number | null,
        public readonly maxOfflineMinutes?: number,
        public readonly endpointAgreementPolicy?: JumpClientEndpointAgreementPolicyType,
    ) {}
}
