import { JumpClientInstallerPlatformType } from '../../enums';

export type JumpClientInstallerKeyInfoDtoOutput = {
    [key in JumpClientInstallerPlatformType]?: {
        encodedInfo?: string;
        filename?: string;
        installerPath?: string;
    };
};
