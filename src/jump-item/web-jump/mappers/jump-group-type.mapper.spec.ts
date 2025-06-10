import { JumpGroupType as BTJumpGroupType } from '../../../beyondtrust-pra-conf-api/jump-item/web-jump/enums';
import { JumpGroupType } from '../enums';
import { mapFromBTJumpGroupType, mapToBTJumpGroupType } from './jump-group-type.mapper';

describe('mapFromBTJumpGroupType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTJumpGroupType).length;
        const enumSize = Object.keys(JumpGroupType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [BTJumpGroupType.Personal, JumpGroupType.Personal],
        [BTJumpGroupType.Shared, JumpGroupType.Shared],
    ])('should map %s to %s', (input: BTJumpGroupType, expected: JumpGroupType) => {
        const result = mapFromBTJumpGroupType(input);
        expect(result).toEqual(expected);
    });

    it('should throw an error for unknown BTJumpGroupType', () => {
        const unknownType = {} as BTJumpGroupType;
        expect(() => mapFromBTJumpGroupType(unknownType)).toThrow();
    });
});

describe('mapToBTJumpGroupType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTJumpGroupType).length;
        const enumSize = Object.keys(JumpGroupType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [JumpGroupType.Personal, BTJumpGroupType.Personal],
        [JumpGroupType.Shared, BTJumpGroupType.Shared],
    ])('should map %s to %s', (input: JumpGroupType, expected: BTJumpGroupType) => {
        const result = mapToBTJumpGroupType(input);
        expect(result).toEqual(expected);
    });

    it('should throw an error for unknown JumpGroupType', () => {
        const unknownType = {} as JumpGroupType;
        expect(() => mapToBTJumpGroupType(unknownType)).toThrow();
    });
});
