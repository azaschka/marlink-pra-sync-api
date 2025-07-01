import { JumpClientInstallerKeyInfoDtoOutput } from '../../beyondtrust-pra-conf-api/jump-client/dtos/outputs';
import { JumpClientInstallerPlatformType } from '../enums';
import { JumpClientInstallerKeyInfo } from '../models';

export function mapFromBTJumpClientInstallerKeyInfo(
    btKeyInfo: JumpClientInstallerKeyInfoDtoOutput,
): JumpClientInstallerKeyInfo[] {
    const keyInfo: JumpClientInstallerKeyInfo[] = [];

    const btKeyInfoPlatformTypes = Object.keys(btKeyInfo) as (keyof JumpClientInstallerKeyInfoDtoOutput)[];

    for (const btKeyInfoPlatformType of btKeyInfoPlatformTypes) {
        if (
            btKeyInfo[btKeyInfoPlatformType] &&
            Object.values(JumpClientInstallerPlatformType).includes(btKeyInfoPlatformType)
        ) {
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
