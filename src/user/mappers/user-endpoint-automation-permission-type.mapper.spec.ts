import { UserEndpointAutomationPermissionType as BTUserEndpointAutomationPermissionType } from '../../beyondtrust-pra-conf-api/user/enums';
import { UserEndpointAutomationPermissionType } from '../enums';
import { mapFromBTUserEndpointAutomationPermissionType } from './user-endpoint-automation-permission-type.mapper';

describe('mapFromBTUserEndpointAutomationPermissionType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTUserEndpointAutomationPermissionType).length;
        const enumSize = Object.keys(UserEndpointAutomationPermissionType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [BTUserEndpointAutomationPermissionType.NotAllowed, UserEndpointAutomationPermissionType.NotAllowed],
        [BTUserEndpointAutomationPermissionType.Administrator, UserEndpointAutomationPermissionType.Administrator],
        [BTUserEndpointAutomationPermissionType.User, UserEndpointAutomationPermissionType.User],
    ])(
        'should map %s to %s',
        (input: BTUserEndpointAutomationPermissionType, expected: UserEndpointAutomationPermissionType) => {
            const result = mapFromBTUserEndpointAutomationPermissionType(input);
            expect(result).toEqual(expected);
        },
    );

    it('should throw an error for unknown BTUserEndpointAutomationPermissionType', () => {
        const unknownType = {} as BTUserEndpointAutomationPermissionType;
        expect(() => mapFromBTUserEndpointAutomationPermissionType(unknownType)).toThrow();
    });
});
