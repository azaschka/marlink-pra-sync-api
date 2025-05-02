import { AccessPermissionStatusType as BTAccessPermissionStatusType } from '../../beyondtrust-pra-conf-api/group-policy/enums';
import { AccessPermissionStatusType } from '../enums';
import {
    mapFromBTAccessPermissionStatusType,
    mapToBTAccessPermissionStatusType,
} from './access-permission-status-type.mapper';

describe('mapFromBTAccessPermissionStatusType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTAccessPermissionStatusType).length;
        const enumSize = Object.keys(AccessPermissionStatusType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [BTAccessPermissionStatusType.NotDefined, AccessPermissionStatusType.NotDefined],
        [BTAccessPermissionStatusType.Defined, AccessPermissionStatusType.Defined],
        [BTAccessPermissionStatusType.Final, AccessPermissionStatusType.Final],
    ])('should map %s to %s', (input: BTAccessPermissionStatusType, expected: AccessPermissionStatusType) => {
        const result = mapFromBTAccessPermissionStatusType(input);
        expect(result).toEqual(expected);
    });

    it('should throw an error for unknown BTAccessPermissionStatusType', () => {
        const unknownType = {} as BTAccessPermissionStatusType;
        expect(() => mapFromBTAccessPermissionStatusType(unknownType)).toThrow();
    });
});

describe('mapToBTAccessPermissionStatusType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTAccessPermissionStatusType).length;
        const enumSize = Object.keys(AccessPermissionStatusType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [AccessPermissionStatusType.NotDefined, BTAccessPermissionStatusType.NotDefined],
        [AccessPermissionStatusType.Defined, BTAccessPermissionStatusType.Defined],
        [AccessPermissionStatusType.Final, BTAccessPermissionStatusType.Final],
    ])('should map %s to %s', (input: AccessPermissionStatusType, expected: BTAccessPermissionStatusType) => {
        const result = mapToBTAccessPermissionStatusType(input);
        expect(result).toEqual(expected);
    });

    it('should throw an error for unknown AccessPermissionStatusType', () => {
        const unknownType = {} as AccessPermissionStatusType;
        expect(() => mapToBTAccessPermissionStatusType(unknownType)).toThrow();
    });
});
