import { ShellJumpTerminalType as BTShellJumpTerminalType } from '../../../beyondtrust-pra-conf-api/jump-item/shell-jump/enums';
import { ShellJumpTerminalType } from '../enums';
import { mapFromBTShellJumpTerminalType, mapToBTShellJumpTerminalType } from './shell-jump-terminal-type.mapper';

describe('mapFromBTShellJumpTerminalType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTShellJumpTerminalType).length;
        const enumSize = Object.keys(ShellJumpTerminalType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [BTShellJumpTerminalType.VT100, ShellJumpTerminalType.VT100],
        [BTShellJumpTerminalType.Xterm, ShellJumpTerminalType.Xterm],
    ])('should map %s to %s', (input: BTShellJumpTerminalType, expected: ShellJumpTerminalType) => {
        const result = mapFromBTShellJumpTerminalType(input);
        expect(result).toEqual(expected);
    });

    it('should throw an error for unknown BTShellJumpTerminalType', () => {
        const unknownType = {} as BTShellJumpTerminalType;
        expect(() => mapFromBTShellJumpTerminalType(unknownType)).toThrow();
    });
});

describe('mapToBTShellJumpTerminalType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTShellJumpTerminalType).length;
        const enumSize = Object.keys(ShellJumpTerminalType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [ShellJumpTerminalType.VT100, BTShellJumpTerminalType.VT100],
        [ShellJumpTerminalType.Xterm, BTShellJumpTerminalType.Xterm],
    ])('should map %s to %s', (input: ShellJumpTerminalType, expected: BTShellJumpTerminalType) => {
        const result = mapToBTShellJumpTerminalType(input);
        expect(result).toEqual(expected);
    });

    it('should throw an error for unknown ShellJumpTerminalType', () => {
        const unknownType = {} as ShellJumpTerminalType;
        expect(() => mapToBTShellJumpTerminalType(unknownType)).toThrow();
    });
});
