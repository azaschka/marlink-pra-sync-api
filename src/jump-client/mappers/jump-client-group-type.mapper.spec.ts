import { JumpClientGroupType as BTJumpClientGroupType } from '../../beyondtrust-pra-conf-api/jump-client/enums';
import { JumpClientGroupType } from '../enums';
import { mapFromBTJumpClientGroupType, mapToBTJumpClientGroupType } from './jump-client-group-type.mapper';

describe('mapFromBTJumpClientGroupType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTJumpClientGroupType).length;
        const enumSize = Object.keys(JumpClientGroupType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [BTJumpClientGroupType.Personal, JumpClientGroupType.Personal],
        [BTJumpClientGroupType.Shared, JumpClientGroupType.Shared],
    ])('should map %s to %s', (input, expected) => {
        const result = mapFromBTJumpClientGroupType(input);
        expect(result).toBe(expected);
    });

    it('should throw an error for unknown BTJumpClientGroupType', () => {
        const unknownType = {} as BTJumpClientGroupType;
        expect(() => mapFromBTJumpClientGroupType(unknownType)).toThrow();
    });
});

describe('mapToBTJumpClientGroupType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTJumpClientGroupType).length;
        const enumSize = Object.keys(JumpClientGroupType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [JumpClientGroupType.Personal, BTJumpClientGroupType.Personal],
        [JumpClientGroupType.Shared, BTJumpClientGroupType.Shared],
    ])('should map %s to %s', (input, expected) => {
        const result = mapToBTJumpClientGroupType(input);
        expect(result).toBe(expected);
    });

    it('should throw an error for unknown JumpClientGroupType', () => {
        const unknownType = {} as JumpClientGroupType;
        expect(() => mapToBTJumpClientGroupType(unknownType)).toThrow();
    });
});
