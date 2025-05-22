import { SimultaneousJumpsRdpType as BTSimultaneousJumpsRdpType } from '../../beyondtrust-pra-conf-api/jump-policy/enums';
import { SimultaneousJumpsRdpType } from '../enums';
import {
    mapFromBTSimultaneousJumpsRdpType,
    mapToBTSimultaneousJumpsRdpType,
} from './simultaneous-jumps-rdp-type.mapper';

describe('mapFromBTSimultaneousJumpsRdpType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTSimultaneousJumpsRdpType).length;
        const enumSize = Object.keys(SimultaneousJumpsRdpType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [BTSimultaneousJumpsRdpType.Global, SimultaneousJumpsRdpType.Global],
        [BTSimultaneousJumpsRdpType.Disallow, SimultaneousJumpsRdpType.Disallow],
        [BTSimultaneousJumpsRdpType.NewSession, SimultaneousJumpsRdpType.NewSession],
    ])('should map %s to %s', (input: BTSimultaneousJumpsRdpType, expected: SimultaneousJumpsRdpType) => {
        const result = mapFromBTSimultaneousJumpsRdpType(input);
        expect(result).toEqual(expected);
    });

    it('should throw an error for unknown BTSimultaneousJumpsRdpType', () => {
        const unknownType = {} as BTSimultaneousJumpsRdpType;
        expect(() => mapFromBTSimultaneousJumpsRdpType(unknownType)).toThrow();
    });
});

describe('mapToBTSimultaneousJumpsRdpType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTSimultaneousJumpsRdpType).length;
        const enumSize = Object.keys(SimultaneousJumpsRdpType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [SimultaneousJumpsRdpType.Global, BTSimultaneousJumpsRdpType.Global],
        [SimultaneousJumpsRdpType.Disallow, BTSimultaneousJumpsRdpType.Disallow],
        [SimultaneousJumpsRdpType.NewSession, BTSimultaneousJumpsRdpType.NewSession],
    ])('should map %s to %s', (input: SimultaneousJumpsRdpType, expected: BTSimultaneousJumpsRdpType) => {
        const result = mapToBTSimultaneousJumpsRdpType(input);
        expect(result).toEqual(expected);
    });

    it('should throw an error for unknown SimultaneousJumpsRdpType', () => {
        const unknownType = {} as SimultaneousJumpsRdpType;
        expect(() => mapToBTSimultaneousJumpsRdpType(unknownType)).toThrow();
    });
});
