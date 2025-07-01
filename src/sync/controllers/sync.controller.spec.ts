import { CommandBus } from '@nestjs/cqrs';
import { SyncController } from './sync.controller';

describe('SyncController', () => {
    let commandBus: CommandBus;
    let controller: SyncController;

    beforeEach(() => {
        commandBus = mockCommandBus();
        controller = new SyncController(commandBus);
    });

    describe('syncUsers', () => {
        it('should return sync result for users', async () => {
            const expectedResult = {
                createdUserIds: ['user1'],
                updatedUserIds: ['user2'],
                deletedUserIds: ['user3'],
            };

            commandBus.execute = jest.fn().mockResolvedValue(expectedResult);

            const result = await controller.syncUsers();

            expect(result).toEqual({
                createdIds: expectedResult.createdUserIds,
                updatedIds: expectedResult.updatedUserIds,
                deletedIds: expectedResult.deletedUserIds,
            });
        });
    });

    describe('syncTeams', () => {
        it('should return sync result for teams', async () => {
            const expectedResult = {
                createdTeamIds: ['team1'],
                updatedTeamIds: ['team2'],
                deletedTeamIds: ['team3'],
            };

            commandBus.execute = jest.fn().mockResolvedValue(expectedResult);

            const result = await controller.syncTeams();

            expect(result).toEqual({
                createdIds: expectedResult.createdTeamIds,
                updatedIds: expectedResult.updatedTeamIds,
                deletedIds: expectedResult.deletedTeamIds,
            });
        });
    });

    describe('syncJumpClients', () => {
        it('should return sync result for jump clients', async () => {
            const expectedResult = {
                createdJumpClientIds: ['jumpClient1'],
                updatedJumpClientIds: ['jumpClient2'],
                deletedJumpClientIds: ['jumpClient3'],
            };

            commandBus.execute = jest.fn().mockResolvedValue(expectedResult);

            const result = await controller.syncJumpClients();

            expect(result).toEqual({
                createdIds: expectedResult.createdJumpClientIds,
                updatedIds: expectedResult.updatedJumpClientIds,
                deletedIds: expectedResult.deletedJumpClientIds,
            });
        });
    });

    describe('syncJumpClientInstallers', () => {
        it('should return sync result for jump client installers', async () => {
            const expectedResult = {
                createdJumpClientInstallerIds: ['installer1'],
                updatedJumpClientInstallerIds: ['installer2'],
                deletedJumpClientInstallerIds: ['installer3'],
            };

            commandBus.execute = jest.fn().mockResolvedValue(expectedResult);

            const result = await controller.syncJumpClientInstallers();

            expect(result).toEqual({
                createdIds: expectedResult.createdJumpClientInstallerIds,
                updatedIds: expectedResult.updatedJumpClientInstallerIds,
                deletedIds: expectedResult.deletedJumpClientInstallerIds,
            });
        });
    });

    describe('syncGroupPolicies', () => {
        it('should return sync result for group policies', async () => {
            const expectedResult = {
                createdGroupPolicyIds: ['policy1'],
                updatedGroupPolicyIds: ['policy2'],
                deletedGroupPolicyIds: ['policy3'],
            };

            commandBus.execute = jest.fn().mockResolvedValue(expectedResult);

            const result = await controller.syncGroupPolicies();

            expect(result).toEqual({
                createdIds: expectedResult.createdGroupPolicyIds,
                updatedIds: expectedResult.updatedGroupPolicyIds,
                deletedIds: expectedResult.deletedGroupPolicyIds,
            });
        });
    });

    describe('syncJumpPolicies', () => {
        it('should return sync result for jump policies', async () => {
            const expectedResult = {
                createdJumpPolicyIds: ['jumpPolicy1'],
                updatedJumpPolicyIds: ['jumpPolicy2'],
                deletedJumpPolicyIds: ['jumpPolicy3'],
            };

            commandBus.execute = jest.fn().mockResolvedValue(expectedResult);

            const result = await controller.syncJumpPolicies();

            expect(result).toEqual({
                createdIds: expectedResult.createdJumpPolicyIds,
                updatedIds: expectedResult.updatedJumpPolicyIds,
                deletedIds: expectedResult.deletedJumpPolicyIds,
            });
        });
    });

    describe('syncJumpGroups', () => {
        it('should return sync result for jump groups', async () => {
            const expectedResult = {
                createdJumpGroupIds: ['jumpGroup1'],
                updatedJumpGroupIds: ['jumpGroup2'],
                deletedJumpGroupIds: ['jumpGroup3'],
            };

            commandBus.execute = jest.fn().mockResolvedValue(expectedResult);

            const result = await controller.syncJumpGroups();

            expect(result).toEqual({
                createdIds: expectedResult.createdJumpGroupIds,
                updatedIds: expectedResult.updatedJumpGroupIds,
                deletedIds: expectedResult.deletedJumpGroupIds,
            });
        });
    });

    describe('syncJumpoints', () => {
        it('should return sync result for jumpoints', async () => {
            const expectedResult = {
                createdJumpointIds: ['jumpoint1'],
                updatedJumpointIds: ['jumpoint2'],
                deletedJumpointIds: ['jumpoint3'],
            };

            commandBus.execute = jest.fn().mockResolvedValue(expectedResult);

            const result = await controller.syncJumpoints();

            expect(result).toEqual({
                createdIds: expectedResult.createdJumpointIds,
                updatedIds: expectedResult.updatedJumpointIds,
                deletedIds: expectedResult.deletedJumpointIds,
            });
        });
    });

    describe('syncJumpItemsProtocolTunnelJumps', () => {
        it('should return sync result for jump items protocol tunnel jumps', async () => {
            const expectedResult = {
                createdProtocolTunnelJumpIds: ['protocolTunnelJump1'],
                updatedProtocolTunnelJumpIds: ['protocolTunnelJump2'],
                deletedProtocolTunnelJumpIds: ['protocolTunnelJump3'],
            };

            commandBus.execute = jest.fn().mockResolvedValue(expectedResult);

            const result = await controller.syncJumpItemsProtocolTunnelJumps();

            expect(result).toEqual({
                createdIds: expectedResult.createdProtocolTunnelJumpIds,
                updatedIds: expectedResult.updatedProtocolTunnelJumpIds,
                deletedIds: expectedResult.deletedProtocolTunnelJumpIds,
            });
        });
    });

    describe('syncJumpItemsRemoteRdps', () => {
        it('should return sync result for jump items remote rdps', async () => {
            const expectedResult = {
                createdRemoteRdpIds: ['remoteRdp1'],
                updatedRemoteRdpIds: ['remoteRdp2'],
                deletedRemoteRdpIds: ['remoteRdp3'],
            };

            commandBus.execute = jest.fn().mockResolvedValue(expectedResult);

            const result = await controller.syncJumpItemsRemoteRdps();

            expect(result).toEqual({
                createdIds: expectedResult.createdRemoteRdpIds,
                updatedIds: expectedResult.updatedRemoteRdpIds,
                deletedIds: expectedResult.deletedRemoteRdpIds,
            });
        });
    });

    describe('syncJumpItemsRemoteVncs', () => {
        it('should return sync result for jump items remote vncs', async () => {
            const expectedResult = {
                createdRemoteVncIds: ['remoteVnc1'],
                updatedRemoteVncIds: ['remoteVnc2'],
                deletedRemoteVncIds: ['remoteVnc3'],
            };

            commandBus.execute = jest.fn().mockResolvedValue(expectedResult);

            const result = await controller.syncJumpItemsRemoteVncs();

            expect(result).toEqual({
                createdIds: expectedResult.createdRemoteVncIds,
                updatedIds: expectedResult.updatedRemoteVncIds,
                deletedIds: expectedResult.deletedRemoteVncIds,
            });
        });
    });

    describe('syncJumpItemsShellJumps', () => {
        it('should return sync result for jump items shell jumps', async () => {
            const expectedResult = {
                createdShellJumpIds: ['shellJump1'],
                updatedShellJumpIds: ['shellJump2'],
                deletedShellJumpIds: ['shellJump3'],
            };

            commandBus.execute = jest.fn().mockResolvedValue(expectedResult);

            const result = await controller.syncJumpItemsShellJumps();

            expect(result).toEqual({
                createdIds: expectedResult.createdShellJumpIds,
                updatedIds: expectedResult.updatedShellJumpIds,
                deletedIds: expectedResult.deletedShellJumpIds,
            });
        });
    });

    describe('syncJumpItemsWebJumps', () => {
        it('should return sync result for jump items web jumps', async () => {
            const expectedResult = {
                createdWebJumpIds: ['webJump1'],
                updatedWebJumpIds: ['webJump2'],
                deletedWebJumpIds: ['webJump3'],
            };

            commandBus.execute = jest.fn().mockResolvedValue(expectedResult);

            const result = await controller.syncJumpItemsWebJumps();

            expect(result).toEqual({
                createdIds: expectedResult.createdWebJumpIds,
                updatedIds: expectedResult.updatedWebJumpIds,
                deletedIds: expectedResult.deletedWebJumpIds,
            });
        });
    });
});

function mockCommandBus() {
    const commandBus = {} as CommandBus;

    commandBus.execute = jest.fn();

    return commandBus;
}
