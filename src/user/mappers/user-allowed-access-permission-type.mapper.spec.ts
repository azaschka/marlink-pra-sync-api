import { UserAllowedAccessPermissionType as BTUserAllowedAccessPermissionType } from '../../beyondtrust-pra-conf-api/user/enums';
import { UserAllowedAccessPermissionType } from '../enums';
import { mapFromBTUserAllowedAccessPermissionType } from './user-allowed-access-permission-type.mapper';

describe('mapFromBTUserAllowedAccessPermissionType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTUserAllowedAccessPermissionType).length;
        const enumSize = Object.keys(UserAllowedAccessPermissionType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [BTUserAllowedAccessPermissionType.NotAllowed, UserAllowedAccessPermissionType.NotAllowed],
        [BTUserAllowedAccessPermissionType.FullSupport, UserAllowedAccessPermissionType.FullSupport],
    ])('should map %s to %s', (input: BTUserAllowedAccessPermissionType, expected: UserAllowedAccessPermissionType) => {
        const result = mapFromBTUserAllowedAccessPermissionType(input);
        expect(result).toEqual(expected);
    });

    it('should throw an error for unknown BTUserAllowedAccessPermissionType', () => {
        const unknownType = {} as BTUserAllowedAccessPermissionType;
        expect(() => mapFromBTUserAllowedAccessPermissionType(unknownType)).toThrow();
    });
});
