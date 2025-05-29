import { JumpointPlatformType as BTJumpointPlatformType } from '../../beyondtrust-pra-conf-api/jumpoint/enums';
import { JumpointPlatformType } from '../enums';
import { mapFromBTJumpointPlatformType, mapToBTJumpointPlatformType } from './jumpoint-platform-type.mapper';

describe('mapFromBTJumpointPlatformType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTJumpointPlatformType).length;
        const enumSize = Object.keys(JumpointPlatformType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [BTJumpointPlatformType.LinuxX86, JumpointPlatformType.LinuxX86],
        [BTJumpointPlatformType.WindowsX86, JumpointPlatformType.WindowsX86],
    ])('should map %s to %s', (input: BTJumpointPlatformType, expected: JumpointPlatformType) => {
        const result = mapFromBTJumpointPlatformType(input);
        expect(result).toEqual(expected);
    });

    it('should throw an error for unknown BTJumpointPlatformType', () => {
        const unknownType = {} as BTJumpointPlatformType;
        expect(() => mapFromBTJumpointPlatformType(unknownType)).toThrow();
    });
});

describe('mapToBTJumpointPlatformType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTJumpointPlatformType).length;
        const enumSize = Object.keys(JumpointPlatformType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [JumpointPlatformType.LinuxX86, BTJumpointPlatformType.LinuxX86],
        [JumpointPlatformType.WindowsX86, BTJumpointPlatformType.WindowsX86],
    ])('should map %s to %s', (input: JumpointPlatformType, expected: BTJumpointPlatformType) => {
        const result = mapToBTJumpointPlatformType(input);
        expect(result).toEqual(expected);
    });

    it('should throw an error for unknown JumpointPlatformType', () => {
        const unknownType = {} as JumpointPlatformType;
        expect(() => mapToBTJumpointPlatformType(unknownType)).toThrow();
    });
});
