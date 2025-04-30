import { QueryBus } from '@nestjs/cqrs';
import { GroupPoliciesRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/group-policy/dtos/outputs';
import { AccessPermissionStatusType as BTAccessPermissionStatusType } from '../../../beyondtrust-pra-conf-api/group-policy/enums';
import { RetrieveGroupPoliciesQuery as BTRetrieveGroupPoliciesQuery } from '../../../beyondtrust-pra-conf-api/group-policy/queries';
import { RetrieveGroupPoliciesQuery } from '../retrieve-group-policies.query';
import { RetrieveGroupPoliciesQueryHandler } from './retrieve-group-policies.query-handler';

// Mock mapper function to return original/input value
jest.mock('../../mappers', () => ({
    mapFromBTAccessPermissionStatusType: jest.fn().mockImplementation((type: BTAccessPermissionStatusType) => type),
}));

abstract class TestHelper {
    public static get mockedGroupPoliciesRetrievedDtoOutputs(): GroupPoliciesRetrievedDtoOutput[] {
        return [
            {
                name: 'group-policy-1',
                id: 1,
                permAccessAllowed: false,
                accessPermStatus: BTAccessPermissionStatusType.Defined,
                permShareOtherTeam: false,
                permInviteExternalUser: false,
                permSessionIdleTimeout: -1,
                permExtendedAvailabilityModeAllowed: false,
                permEditExternalKey: false,
                permCollaborate: false,
                permCollaborateControl: false,
                permJumpClient: false,
                permLocalJump: false,
                permRemoteJump: false,
                permRemoteVnc: false,
                permRemoteRdp: false,
                permShellJump: false,
                permWebJump: false,
                permProtocolTunnel: false,
                permSdStaticPortForExternalTools: false,
                defaultJumpItemRoleId: 1,
                privateJumpItemRoleId: 1,
                inferiorJumpItemRoleId: 1,
                unassignedJumpItemRoleId: 1,
            },
            {
                name: 'group-policy-2',
                id: 2,
                permAccessAllowed: true,
                accessPermStatus: BTAccessPermissionStatusType.Final,
                permShareOtherTeam: true,
                permInviteExternalUser: true,
                permSessionIdleTimeout: 30,
                permExtendedAvailabilityModeAllowed: true,
                permEditExternalKey: true,
                permCollaborate: true,
                permCollaborateControl: true,
                permJumpClient: true,
                permLocalJump: true,
                permRemoteJump: true,
                permRemoteVnc: true,
                permRemoteRdp: true,
                permShellJump: true,
                permWebJump: true,
                permProtocolTunnel: true,
                permSdStaticPortForExternalTools: true,
            },
        ];
    }
}

describe('RetrieveGroupPoliciesQueryHandler', () => {
    let queryBus: QueryBus;
    let handler: RetrieveGroupPoliciesQueryHandler;

    beforeEach(() => {
        queryBus = mockQueryBus();
        handler = new RetrieveGroupPoliciesQueryHandler(queryBus);
    });

    describe('execute', () => {
        it.each([
            <RetrieveGroupPoliciesQuery>{
                transactionId: 'transaction-1',
                pageSize: 10,
                pageNumber: 1,
                name: 'group-policy-1',
            },
            <RetrieveGroupPoliciesQuery>{
                transactionId: 'transaction-2',
                pageSize: 20,
                pageNumber: 2,
            },
        ])('should call the query bus with correct parameters and return the result', async (query) => {
            const queryBusExecuteMethod = jest.spyOn(queryBus, 'execute');

            const result = await handler.execute(query);

            expect(queryBusExecuteMethod).toHaveBeenCalledWith(
                new BTRetrieveGroupPoliciesQuery(query.transactionId, query.pageSize, query.pageNumber, query.name),
            );

            expect(result.length).toBe(TestHelper.mockedGroupPoliciesRetrievedDtoOutputs.length);

            for (let i = 0; i < result.length; i++) {
                expect(result[i]).toStrictEqual({
                    name: TestHelper.mockedGroupPoliciesRetrievedDtoOutputs[i]?.name,
                    id: TestHelper.mockedGroupPoliciesRetrievedDtoOutputs[i]?.id,
                    hasEndpointsAccessPermission:
                        TestHelper.mockedGroupPoliciesRetrievedDtoOutputs[i]?.permAccessAllowed,
                    accessPermissionStatusType: TestHelper.mockedGroupPoliciesRetrievedDtoOutputs[i]?.accessPermStatus,
                    hasShareOtherTeamPermission:
                        TestHelper.mockedGroupPoliciesRetrievedDtoOutputs[i]?.permShareOtherTeam,
                    hasInviteExternalUserPermission:
                        TestHelper.mockedGroupPoliciesRetrievedDtoOutputs[i]?.permInviteExternalUser,
                    userSessionIdleTimeoutInSeconds:
                        TestHelper.mockedGroupPoliciesRetrievedDtoOutputs[i]?.permSessionIdleTimeout,
                    hasEnableExtendedAvailabilityModePermission:
                        TestHelper.mockedGroupPoliciesRetrievedDtoOutputs[i]?.permExtendedAvailabilityModeAllowed,
                    hasEditExternalKeyPermission:
                        TestHelper.mockedGroupPoliciesRetrievedDtoOutputs[i]?.permEditExternalKey,
                    hasCollaboratePermission: TestHelper.mockedGroupPoliciesRetrievedDtoOutputs[i]?.permCollaborate,
                    hasCollaborateControlPermission:
                        TestHelper.mockedGroupPoliciesRetrievedDtoOutputs[i]?.permCollaborateControl,
                    hasJumpClientPermission: TestHelper.mockedGroupPoliciesRetrievedDtoOutputs[i]?.permJumpClient,
                    hasLocalJumpPermission: TestHelper.mockedGroupPoliciesRetrievedDtoOutputs[i]?.permLocalJump,
                    hasRemoteJumpPermission: TestHelper.mockedGroupPoliciesRetrievedDtoOutputs[i]?.permRemoteJump,
                    hasRemoteVncPermission: TestHelper.mockedGroupPoliciesRetrievedDtoOutputs[i]?.permRemoteVnc,
                    hasRemoteRdpPermission: TestHelper.mockedGroupPoliciesRetrievedDtoOutputs[i]?.permRemoteRdp,
                    hasShellJumpPermission: TestHelper.mockedGroupPoliciesRetrievedDtoOutputs[i]?.permShellJump,
                    hasWebJumpPermission: TestHelper.mockedGroupPoliciesRetrievedDtoOutputs[i]?.permWebJump,
                    hasProtocolTunnelPermission:
                        TestHelper.mockedGroupPoliciesRetrievedDtoOutputs[i]?.permProtocolTunnel,
                    hasSdStaticPortForExternalToolsPermission:
                        TestHelper.mockedGroupPoliciesRetrievedDtoOutputs[i]?.permSdStaticPortForExternalTools,
                    defaultJumpItemRoleId: TestHelper.mockedGroupPoliciesRetrievedDtoOutputs[i]?.defaultJumpItemRoleId,
                    privateJumpItemRoleId: TestHelper.mockedGroupPoliciesRetrievedDtoOutputs[i]?.privateJumpItemRoleId,
                    inferiorJumpItemRoleId:
                        TestHelper.mockedGroupPoliciesRetrievedDtoOutputs[i]?.inferiorJumpItemRoleId,
                    unassignedJumpItemRoleId:
                        TestHelper.mockedGroupPoliciesRetrievedDtoOutputs[i]?.unassignedJumpItemRoleId,
                });
            }
        });
    });
});

function mockQueryBus() {
    const queryBus = {} as QueryBus;
    queryBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedGroupPoliciesRetrievedDtoOutputs);

    return queryBus;
}
