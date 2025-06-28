import { JumpClientInstallerPlatformType } from '../enums';

export class RetrieveJumpClientInstallerPlatformQuery {
    public readonly queryType = 'bt-retrieve-jump-client-installer-platform';

    constructor(
        public readonly transactionId: string,
        public readonly installerId: number,
        public readonly platform: JumpClientInstallerPlatformType,
    ) {}
}
