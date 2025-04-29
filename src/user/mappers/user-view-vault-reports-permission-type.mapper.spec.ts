import { UserViewVaultReportsPermissionType as BTUserViewVaultReportsPermissionType } from '../../beyondtrust-pra-conf-api/user/enums';
import { UserViewVaultReportsPermissionType } from '../enums';
import { mapFromBTUserViewVaultReportsPermissionType } from './user-view-vault-reports-permission-type.mapper';

describe('mapFromBTUserViewVaultReportsPermissionType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTUserViewVaultReportsPermissionType).length;
        const enumSize = Object.keys(UserViewVaultReportsPermissionType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [BTUserViewVaultReportsPermissionType.NotAllowed, UserViewVaultReportsPermissionType.NotAllowed],
        [BTUserViewVaultReportsPermissionType.ViewAllEvents, UserViewVaultReportsPermissionType.ViewAllEvents],
        [BTUserViewVaultReportsPermissionType.ViewUserEvents, UserViewVaultReportsPermissionType.ViewUserEvents],
    ])('should map %s to %s', (input, expected) => {
        const result = mapFromBTUserViewVaultReportsPermissionType(input);
        expect(result).toBe(expected);
    });

    it('should throw an error for unknown BTUserViewVaultReportsPermissionType', () => {
        const unknownType = {} as BTUserViewVaultReportsPermissionType;
        expect(() => mapFromBTUserViewVaultReportsPermissionType(unknownType)).toThrow();
    });
});
