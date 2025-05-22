import { SimultaneousJumpsType as BTSimultaneousJumpsType } from '../../beyondtrust-pra-conf-api/jump-policy/enums';
import { SimultaneousJumpsType } from '../enums';
import { mapFromBTSimultaneousJumpsType, mapToBTSimultaneousJumpsType } from './simultaneous-jumps-type.mapper';

describe('mapFromBTSimultaneousJumpsType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTSimultaneousJumpsType).length;
        const enumSize = Object.keys(SimultaneousJumpsType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [BTSimultaneousJumpsType.Global, SimultaneousJumpsType.Global],
        [BTSimultaneousJumpsType.Disallow, SimultaneousJumpsType.Disallow],
        [BTSimultaneousJumpsType.Join, SimultaneousJumpsType.Join],
    ])('should map %s to %s', (input: BTSimultaneousJumpsType, expected: SimultaneousJumpsType) => {
        const result = mapFromBTSimultaneousJumpsType(input);
        expect(result).toEqual(expected);
    });

    it('should throw an error for unknown BTSimultaneousJumpsType', () => {
        const unknownType = {} as BTSimultaneousJumpsType;
        expect(() => mapFromBTSimultaneousJumpsType(unknownType)).toThrow();
    });
});

describe('mapToBTSimultaneousJumpsType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTSimultaneousJumpsType).length;
        const enumSize = Object.keys(SimultaneousJumpsType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [SimultaneousJumpsType.Global, BTSimultaneousJumpsType.Global],
        [SimultaneousJumpsType.Disallow, BTSimultaneousJumpsType.Disallow],
        [SimultaneousJumpsType.Join, BTSimultaneousJumpsType.Join],
    ])('should map %s to %s', (input: SimultaneousJumpsType, expected: BTSimultaneousJumpsType) => {
        const result = mapToBTSimultaneousJumpsType(input);
        expect(result).toEqual(expected);
    });

    it('should throw an error for unknown SimultaneousJumpsType', () => {
        const unknownType = {} as SimultaneousJumpsType;
        expect(() => mapToBTSimultaneousJumpsType(unknownType)).toThrow();
    });
});
