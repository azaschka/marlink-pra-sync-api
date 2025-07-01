import { JumpClientInstallerPlatformType as BTJumpClientInstallerPlatformType } from '../../beyondtrust-pra-conf-api/jump-client/enums';
import { JumpClientInstallerPlatformType } from '../enums';
import { mapFromBTJumpClientInstallerPlatformType } from './jump-client-installer-platform-type.mapper';

describe('mapFromBTJumpClientInstallerPlatformType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTJumpClientInstallerPlatformType).length;
        const enumSize = Object.keys(JumpClientInstallerPlatformType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [BTJumpClientInstallerPlatformType.Linux64, JumpClientInstallerPlatformType.Linux64],
        [BTJumpClientInstallerPlatformType.Linux64Headless, JumpClientInstallerPlatformType.Linux64Headless],
        [BTJumpClientInstallerPlatformType.MacDmg, JumpClientInstallerPlatformType.MacDmg],
        [BTJumpClientInstallerPlatformType.MacZip, JumpClientInstallerPlatformType.MacZip],
        [BTJumpClientInstallerPlatformType.Windows64, JumpClientInstallerPlatformType.Windows64],
        [BTJumpClientInstallerPlatformType.Windows64Msi, JumpClientInstallerPlatformType.Windows64Msi],
        [
            BTJumpClientInstallerPlatformType.RaspberryPi32Headless,
            JumpClientInstallerPlatformType.RaspberryPi32Headless,
        ],
        [BTJumpClientInstallerPlatformType.Windows32, JumpClientInstallerPlatformType.Windows32],
        [BTJumpClientInstallerPlatformType.Windows32Msi, JumpClientInstallerPlatformType.Windows32Msi],
    ])('should map %s to %s', (input, expected) => {
        const result = mapFromBTJumpClientInstallerPlatformType(input);
        expect(result).toBe(expected);
    });

    it('should throw an error for unknown BTJumpClientInstallerPlatformType', () => {
        const unknownType = {} as BTJumpClientInstallerPlatformType;
        expect(() => mapFromBTJumpClientInstallerPlatformType(unknownType)).toThrow();
    });
});
