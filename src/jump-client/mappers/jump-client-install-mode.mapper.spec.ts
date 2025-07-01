import { JumpClientInstallMode as BTJumpClientInstallMode } from '../../beyondtrust-pra-conf-api/jump-client/enums';
import { JumpClientInstallMode } from '../enums';
import { mapFromBTJumpClientInstallMode } from './jump-client-install-mode.mapper';

describe('mapFromBTJumpClientInstallMode', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTJumpClientInstallMode).length;
        const enumSize = Object.keys(JumpClientInstallMode).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [BTJumpClientInstallMode.Service, JumpClientInstallMode.Service],
        [BTJumpClientInstallMode.Unknown, JumpClientInstallMode.Unknown],
        [BTJumpClientInstallMode.User, JumpClientInstallMode.User],
    ])('should map %s to %s', (input, expected) => {
        const result = mapFromBTJumpClientInstallMode(input);
        expect(result).toBe(expected);
    });

    it('should throw an error for unknown BTJumpClientInstallMode', () => {
        const unknownType = {} as BTJumpClientInstallMode;
        expect(() => mapFromBTJumpClientInstallMode(unknownType)).toThrow();
    });
});
