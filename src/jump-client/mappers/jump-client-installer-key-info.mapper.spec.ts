/* eslint-disable @typescript-eslint/naming-convention */
import { JumpClientInstallerKeyInfoDtoOutput } from '../../beyondtrust-pra-conf-api/jump-client/dtos/outputs';
import { JumpClientInstallerPlatformType } from '../enums';
import { mapFromBTJumpClientInstallerKeyInfo } from './jump-client-installer-key-info.mapper';

describe('mapFromBTJumpClientInstallerKeyInfo', () => {
    it('should return as expected', () => {
        const result = mapFromBTJumpClientInstallerKeyInfo({
            'linux-64-headless': {
                encodedInfo: 'linux-64-headless-encoded-info',
                filename: 'linux-64-headless-filename',
                installerPath: '/path/to/linux-64-headless-installer',
            },
            'linux-64': {
                encodedInfo: 'linux-64-encoded-info',
                filename: 'linux-64-filename',
                installerPath: '/path/to/linux-64-installer',
            },
            'mac-dmg': {
                encodedInfo: 'mac-dmg-encoded-info',
                filename: 'mac-dmg-filename',
                installerPath: '/path/to/mac-dmg-installer',
            },
            'mac-zip': {
                encodedInfo: 'mac-zip-encoded-info',
                filename: 'mac-zip-filename',
                installerPath: '/path/to/mac-zip-installer',
            },
            'raspberry-pi-32-headless': {
                encodedInfo: 'raspberry-pi-32-headless-encoded-info',
                filename: 'raspberry-pi-32-headless-filename',
                installerPath: '/path/to/raspberry-pi-32-headless-installer',
            },
            'windows-32-msi': {
                encodedInfo: 'windows-32-msi-encoded-info',
                filename: 'windows-32-msi-filename',
                installerPath: '/path/to/windows-32-msi-installer',
            },
            'windows-32': {
                encodedInfo: 'windows-32-encoded-info',
                filename: 'windows-32-filename',
                installerPath: '/path/to/windows-32-installer',
            },
            'windows-64-msi': {
                encodedInfo: 'windows-64-msi-encoded-info',
                filename: 'windows-64-msi-filename',
                installerPath: '/path/to/windows-64-msi-installer',
            },
            'windows-64': {
                encodedInfo: 'windows-64-encoded-info',
                filename: 'windows-64-filename',
                installerPath: '/path/to/windows-64-installer',
            },
            unknown: {
                encodedInfo: 'unknown-encoded-info',
                filename: 'unknown-filename',
                installerPath: '/path/to/unknown-installer',
            },
        } as JumpClientInstallerKeyInfoDtoOutput);

        expect(result).toStrictEqual([
            {
                platformType: JumpClientInstallerPlatformType.Linux64Headless,
                encodedInfo: 'linux-64-headless-encoded-info',
                filename: 'linux-64-headless-filename',
                installerPath: '/path/to/linux-64-headless-installer',
            },
            {
                platformType: JumpClientInstallerPlatformType.Linux64,
                encodedInfo: 'linux-64-encoded-info',
                filename: 'linux-64-filename',
                installerPath: '/path/to/linux-64-installer',
            },
            {
                platformType: JumpClientInstallerPlatformType.MacDmg,
                encodedInfo: 'mac-dmg-encoded-info',
                filename: 'mac-dmg-filename',
                installerPath: '/path/to/mac-dmg-installer',
            },
            {
                platformType: JumpClientInstallerPlatformType.MacZip,
                encodedInfo: 'mac-zip-encoded-info',
                filename: 'mac-zip-filename',
                installerPath: '/path/to/mac-zip-installer',
            },
            {
                platformType: JumpClientInstallerPlatformType.RaspberryPi32Headless,
                encodedInfo: 'raspberry-pi-32-headless-encoded-info',
                filename: 'raspberry-pi-32-headless-filename',
                installerPath: '/path/to/raspberry-pi-32-headless-installer',
            },
            {
                platformType: JumpClientInstallerPlatformType.Windows32Msi,
                encodedInfo: 'windows-32-msi-encoded-info',
                filename: 'windows-32-msi-filename',
                installerPath: '/path/to/windows-32-msi-installer',
            },
            {
                platformType: JumpClientInstallerPlatformType.Windows32,
                encodedInfo: 'windows-32-encoded-info',
                filename: 'windows-32-filename',
                installerPath: '/path/to/windows-32-installer',
            },
            {
                platformType: JumpClientInstallerPlatformType.Windows64Msi,
                encodedInfo: 'windows-64-msi-encoded-info',
                filename: 'windows-64-msi-filename',
                installerPath: '/path/to/windows-64-msi-installer',
            },
            {
                platformType: JumpClientInstallerPlatformType.Windows64,
                encodedInfo: 'windows-64-encoded-info',
                filename: 'windows-64-filename',
                installerPath: '/path/to/windows-64-installer',
            },
        ]);
    });
});
