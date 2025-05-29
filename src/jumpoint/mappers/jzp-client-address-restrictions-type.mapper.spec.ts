import { JzpClientAddressRestrictionsType as BTJzpClientAddressRestrictionsType } from '../../beyondtrust-pra-conf-api/jumpoint/enums';
import { JzpClientAddressRestrictionsType } from '../enums';
import {
    mapFromBTJzpClientAddressRestrictionsType,
    mapToBTJzpClientAddressRestrictionsType,
} from './jzp-client-address-restrictions-type.mapper';

describe('mapFromBTJzpClientAddressRestrictionsType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTJzpClientAddressRestrictionsType).length;
        const enumSize = Object.keys(JzpClientAddressRestrictionsType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [BTJzpClientAddressRestrictionsType.AllowAll, JzpClientAddressRestrictionsType.AllowAll],
        [BTJzpClientAddressRestrictionsType.DenyAll, JzpClientAddressRestrictionsType.DenyAll],
        [BTJzpClientAddressRestrictionsType.NoRestriction, JzpClientAddressRestrictionsType.NoRestriction],
    ])(
        'should map %s to %s',
        (input: BTJzpClientAddressRestrictionsType, expected: JzpClientAddressRestrictionsType) => {
            const result = mapFromBTJzpClientAddressRestrictionsType(input);
            expect(result).toEqual(expected);
        },
    );

    it('should throw an error for unknown BTJzpClientAddressRestrictionsType', () => {
        const unknownType = {} as BTJzpClientAddressRestrictionsType;
        expect(() => mapFromBTJzpClientAddressRestrictionsType(unknownType)).toThrow();
    });
});

describe('mapToBTJzpClientAddressRestrictionsType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTJzpClientAddressRestrictionsType).length;
        const enumSize = Object.keys(JzpClientAddressRestrictionsType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [JzpClientAddressRestrictionsType.AllowAll, BTJzpClientAddressRestrictionsType.AllowAll],
        [JzpClientAddressRestrictionsType.DenyAll, BTJzpClientAddressRestrictionsType.DenyAll],
        [JzpClientAddressRestrictionsType.NoRestriction, BTJzpClientAddressRestrictionsType.NoRestriction],
    ])(
        'should map %s to %s',
        (input: JzpClientAddressRestrictionsType, expected: BTJzpClientAddressRestrictionsType) => {
            const result = mapToBTJzpClientAddressRestrictionsType(input);
            expect(result).toEqual(expected);
        },
    );

    it('should throw an error for unknown JzpClientAddressRestrictionsType', () => {
        const unknownType = {} as JzpClientAddressRestrictionsType;
        expect(() => mapToBTJzpClientAddressRestrictionsType(unknownType)).toThrow();
    });
});
