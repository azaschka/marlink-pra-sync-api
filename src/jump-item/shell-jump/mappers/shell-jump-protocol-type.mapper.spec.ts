import { ShellJumpProtocolType as BTShellJumpProtocolType } from '../../../beyondtrust-pra-conf-api/jump-item/shell-jump/enums';
import { ShellJumpProtocolType } from '../enums';
import { mapFromBTShellJumpProtocolType, mapToBTShellJumpProtocolType } from './shell-jump-protocol-type.mapper';

describe('mapFromBTShellJumpProtocolType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTShellJumpProtocolType).length;
        const enumSize = Object.keys(ShellJumpProtocolType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [BTShellJumpProtocolType.SSH, ShellJumpProtocolType.SSH],
        [BTShellJumpProtocolType.TELNET, ShellJumpProtocolType.TELNET],
    ])('should map %s to %s', (input: BTShellJumpProtocolType, expected: ShellJumpProtocolType) => {
        const result = mapFromBTShellJumpProtocolType(input);
        expect(result).toEqual(expected);
    });

    it('should throw an error for unknown BTShellJumpProtocolType', () => {
        const unknownType = {} as BTShellJumpProtocolType;
        expect(() => mapFromBTShellJumpProtocolType(unknownType)).toThrow();
    });
});

describe('mapToBTShellJumpProtocolType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTShellJumpProtocolType).length;
        const enumSize = Object.keys(ShellJumpProtocolType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [ShellJumpProtocolType.SSH, BTShellJumpProtocolType.SSH],
        [ShellJumpProtocolType.TELNET, BTShellJumpProtocolType.TELNET],
    ])('should map %s to %s', (input: ShellJumpProtocolType, expected: BTShellJumpProtocolType) => {
        const result = mapToBTShellJumpProtocolType(input);
        expect(result).toEqual(expected);
    });

    it('should throw an error for unknown ShellJumpProtocolType', () => {
        const unknownType = {} as ShellJumpProtocolType;
        expect(() => mapToBTShellJumpProtocolType(unknownType)).toThrow();
    });
});
