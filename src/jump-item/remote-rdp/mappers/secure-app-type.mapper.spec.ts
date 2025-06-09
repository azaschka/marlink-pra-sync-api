import { SecureAppType as BTSecureAppType } from '../../../beyondtrust-pra-conf-api/jump-item/remote-rdp/enums';
import { SecureAppType } from '../enums';
import { mapFromBTSecureAppType, mapToBTSecureAppType } from './secure-app-type.mapper';

describe('mapFromBTSecureAppType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTSecureAppType).length;
        const enumSize = Object.keys(SecureAppType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [BTSecureAppType.None, SecureAppType.None],
        [BTSecureAppType.RemoteApp, SecureAppType.RemoteApp],
        [BTSecureAppType.RemoteDesktopAgent, SecureAppType.RemoteDesktopAgent],
        [BTSecureAppType.RemoteDesktopAgentCredentials, SecureAppType.RemoteDesktopAgentCredentials],
    ])('should map %s to %s', (input: BTSecureAppType, expected: SecureAppType) => {
        const result = mapFromBTSecureAppType(input);
        expect(result).toEqual(expected);
    });

    it('should throw an error for unknown BTSecureAppType', () => {
        const unknownType = {} as BTSecureAppType;
        expect(() => mapFromBTSecureAppType(unknownType)).toThrow();
    });
});

describe('mapToBTSecureAppType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTSecureAppType).length;
        const enumSize = Object.keys(SecureAppType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [SecureAppType.None, BTSecureAppType.None],
        [SecureAppType.RemoteApp, BTSecureAppType.RemoteApp],
        [SecureAppType.RemoteDesktopAgent, BTSecureAppType.RemoteDesktopAgent],
        [SecureAppType.RemoteDesktopAgentCredentials, BTSecureAppType.RemoteDesktopAgentCredentials],
    ])('should map %s to %s', (input: SecureAppType, expected: BTSecureAppType) => {
        const result = mapToBTSecureAppType(input);
        expect(result).toEqual(expected);
    });

    it('should throw an error for unknown SecureAppType', () => {
        const unknownType = {} as SecureAppType;
        expect(() => mapToBTSecureAppType(unknownType)).toThrow();
    });
});
