import { JumpClientConnectionType, JumpClientGroupType } from '../enums';

export class CreateJumpClientInstallerCommand {
    public readonly commandType = 'bt-create-jump-client-installer';

    constructor(
        public readonly transactionId: string,
        public readonly beyondtrustInstanceId: number,
        public readonly jumpGroupId: number,
        public readonly name?: string,
        public readonly jumpGroupType?: JumpClientGroupType,
        public readonly jumpPolicyId?: number,
        public readonly tag?: string,
        public readonly connectionType?: JumpClientConnectionType,
        public readonly sessionPolicyId?: number | null,
        public readonly comments?: string,
        public readonly validDuration?: number,
        public readonly elevateInstall?: boolean,
        public readonly elevatePrompt?: boolean,
        public readonly allowOverrideJumpGroup?: boolean,
        public readonly allowOverrideJumpPolicy?: boolean,
        public readonly allowOverrideName?: boolean,
        public readonly allowOverrideTag?: boolean,
        public readonly allowOverrideComments?: boolean,
        public readonly allowOverrideSessionPolicy?: boolean,
        public readonly jumpointProxy?: string | null,
    ) {}
}
