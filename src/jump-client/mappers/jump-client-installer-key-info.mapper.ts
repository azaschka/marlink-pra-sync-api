import { JumpClientInstallerKeyInfoDtoOutput } from '../../beyondtrust-pra-conf-api/jump-client/dtos/outputs';
import { JumpClientInstallerPlatformType } from '../enums';
import { JumpClientInstallerKeyInfo } from '../models';

export function mapFromBTJumpClientInstallerKeyInfo(
    btKeyInfo: JumpClientInstallerKeyInfoDtoOutput,
): JumpClientInstallerKeyInfo[] {
    const keyInfo: JumpClientInstallerKeyInfo[] = [];

    const btKeyInfoPlatformTypes = Object.keys(btKeyInfo) as (keyof JumpClientInstallerKeyInfoDtoOutput)[];

    for (const btKeyInfoPlatformType of btKeyInfoPlatformTypes) {
        if (!Object.values(JumpClientInstallerPlatformType).includes(btKeyInfoPlatformType)) {
            throw new Error(`Unknown BTJumpClientInstallerPlatformType: ${btKeyInfoPlatformType}`);
        }

        if (btKeyInfo[btKeyInfoPlatformType]) {
            keyInfo.push({
                platformType: btKeyInfoPlatformType,
                encodedInfo: btKeyInfo[btKeyInfoPlatformType].encodedInfo,
                filename: btKeyInfo[btKeyInfoPlatformType].filename,
                installerPath: btKeyInfo[btKeyInfoPlatformType].installerPath,
            });
        }
    }

    return keyInfo;
}
