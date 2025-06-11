import { UserTeamRoleType as BTUserTeamRoleType } from '../../beyondtrust-pra-conf-api/team/enums';
import { UserTeamRoleType } from '../enums';
import { mapFromBTUserTeamRoleType, mapToBTUserTeamRoleType } from './user-team-role-type.mapper';

describe('mapFromBTUserTeamRoleType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTUserTeamRoleType).length;
        const enumSize = Object.keys(UserTeamRoleType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [BTUserTeamRoleType.Lead, UserTeamRoleType.Lead],
        [BTUserTeamRoleType.Manager, UserTeamRoleType.Manager],
        [BTUserTeamRoleType.Member, UserTeamRoleType.Member],
    ])('should map %s to %s', (input: BTUserTeamRoleType, expected: UserTeamRoleType) => {
        const result = mapFromBTUserTeamRoleType(input);
        expect(result).toEqual(expected);
    });

    it('should throw an error for unknown BTUserTeamRoleType', () => {
        const unknownType = {} as BTUserTeamRoleType;
        expect(() => mapFromBTUserTeamRoleType(unknownType)).toThrow();
    });
});

describe('mapToBTUserTeamRoleType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTUserTeamRoleType).length;
        const enumSize = Object.keys(UserTeamRoleType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [UserTeamRoleType.Lead, BTUserTeamRoleType.Lead],
        [UserTeamRoleType.Manager, BTUserTeamRoleType.Manager],
        [UserTeamRoleType.Member, BTUserTeamRoleType.Member],
    ])('should map %s to %s', (input: UserTeamRoleType, expected: BTUserTeamRoleType) => {
        const result = mapToBTUserTeamRoleType(input);
        expect(result).toEqual(expected);
    });

    it('should throw an error for unknown UserTeamRoleType', () => {
        const unknownType = {} as UserTeamRoleType;
        expect(() => mapToBTUserTeamRoleType(unknownType)).toThrow();
    });
});
