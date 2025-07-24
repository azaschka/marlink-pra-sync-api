import { JumpClientInstallerPlatformType } from '../enums';

export class RetrieveJumpClientInstallerPlatformQuery {
    public readonly queryType = 'bt-retrieve-jump-client-installer-platform';

    constructor(
        public readonly transactionId: string,
        public readonly installerId: string,
        public readonly platform: JumpClientInstallerPlatformType,
    ) {}
}
