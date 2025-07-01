import { JumpClientConnectionType as BTJumpClientConnectionType } from '../../beyondtrust-pra-conf-api/jump-client/enums';
import { JumpClientConnectionType } from '../enums';
import { mapFromBTJumpClientConnectionType } from './jump-client-connection-type.mapper';

describe('mapFromBTJumpClientConnectionType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTJumpClientConnectionType).length;
        const enumSize = Object.keys(JumpClientConnectionType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [BTJumpClientConnectionType.Active, JumpClientConnectionType.Active],
        [BTJumpClientConnectionType.Passive, JumpClientConnectionType.Passive],
        [BTJumpClientConnectionType.Uninstalled, JumpClientConnectionType.Uninstalled],
    ])('should map %s to %s', (input: BTJumpClientConnectionType, expected: JumpClientConnectionType) => {
        const result = mapFromBTJumpClientConnectionType(input);
        expect(result).toEqual(expected);
    });

    it('should throw an error for unknown BTJumpClientConnectionType', () => {
        const unknownType = {} as BTJumpClientConnectionType;
        expect(() => mapFromBTJumpClientConnectionType(unknownType)).toThrow();
    });
});

describe('mapToBTJumpClientConnectionType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTJumpClientConnectionType).length;
        const enumSize = Object.keys(JumpClientConnectionType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [JumpClientConnectionType.Active, BTJumpClientConnectionType.Active],
        [JumpClientConnectionType.Passive, BTJumpClientConnectionType.Passive],
        [JumpClientConnectionType.Uninstalled, BTJumpClientConnectionType.Uninstalled],
    ])('should map %s to %s', (input: JumpClientConnectionType, expected: BTJumpClientConnectionType) => {
        const result = mapFromBTJumpClientConnectionType(input);
        expect(result).toEqual(expected);
    });

    it('should throw an error for unknown JumpClientConnectionType', () => {
        const unknownType = {} as JumpClientConnectionType;
        expect(() => mapFromBTJumpClientConnectionType(unknownType)).toThrow();
    });
});
