import { UserViewSupportReportsPermissionType as BTUserViewSupportReportsPermissionType } from '../../beyondtrust-pra-conf-api/user/enums';
import { UserViewSupportReportsPermissionType } from '../enums';
import { mapFromBTUserViewSupportReportsPermissionType } from './user-view-support-reports-permission-type.mapper';

describe('mapFromBTUserViewSupportReportsPermissionType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTUserViewSupportReportsPermissionType).length;
        const enumSize = Object.keys(UserViewSupportReportsPermissionType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [BTUserViewSupportReportsPermissionType.NotAllowed, UserViewSupportReportsPermissionType.NotAllowed],
        [BTUserViewSupportReportsPermissionType.UserSessions, UserViewSupportReportsPermissionType.UserSessions],
        [BTUserViewSupportReportsPermissionType.AllSessions, UserViewSupportReportsPermissionType.AllSessions],
        [BTUserViewSupportReportsPermissionType.TeamSessions, UserViewSupportReportsPermissionType.TeamSessions],
        [
            BTUserViewSupportReportsPermissionType.JumpGroupSessions,
            UserViewSupportReportsPermissionType.JumpGroupSessions,
        ],
    ])(
        'should map %s to %s',
        (input: BTUserViewSupportReportsPermissionType, expected: UserViewSupportReportsPermissionType) => {
            const result = mapFromBTUserViewSupportReportsPermissionType(input);
            expect(result).toEqual(expected);
        },
    );

    it('should throw an error for unknown BTUserViewSupportReportsPermissionType', () => {
        const unknownType = {} as BTUserViewSupportReportsPermissionType;
        expect(() => mapFromBTUserViewSupportReportsPermissionType(unknownType)).toThrow();
    });
});
