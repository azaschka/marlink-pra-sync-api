import { CommandBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../app-config/services/app-config.service';
import { SyncEntityType } from '../enums';
import { SyncController } from './sync.controller';

describe('SyncController', () => {
    let appConfigService: AppConfigService;
    let commandBus: CommandBus;
    let controller: SyncController;

    beforeEach(() => {
        // Mock console.log to prevent cluttering the test output
        jest.spyOn(console, 'log').mockImplementation(() => {});
        appConfigService = mockAppConfigService();
        commandBus = mockCommandBus();
        controller = new SyncController(commandBus, appConfigService);
    });

    describe('syncAll', () => {
        it('should call all sync methods and return the aggregated result', async () => {
            const expectedResult = {
                tenantId: 123123,
                syncEntityType: SyncEntityType.GroupPolicy,
                totalBtData: 0,
                totalDbData: 0,
                identicalDataIds: [],
                onlyInBtIds: [],
                onlyInDbIds: [],
                differentDataIds: [],
            };
            const syncUsersMethod = jest.spyOn(controller, 'syncUsers').mockResolvedValue(expectedResult);
            const syncTeamsMethod = jest.spyOn(controller, 'syncTeams').mockResolvedValue(expectedResult);
            const syncJumpClientsMethod = jest.spyOn(controller, 'syncJumpClients').mockResolvedValue(expectedResult);
            const syncJumpClientInstallersMethod = jest
                .spyOn(controller, 'syncJumpClientInstallers')
                .mockResolvedValue(expectedResult);
            const syncGroupPoliciesMethod = jest
                .spyOn(controller, 'syncGroupPolicies')
                .mockResolvedValue(expectedResult);
            const syncJumpPoliciesMethod = jest.spyOn(controller, 'syncJumpPolicies').mockResolvedValue(expectedResult);
            const syncJumpGroupsMethod = jest.spyOn(controller, 'syncJumpGroups').mockResolvedValue(expectedResult);
            const syncJumpointsMethod = jest.spyOn(controller, 'syncJumpoints').mockResolvedValue(expectedResult);
            const syncJumpItemsProtocolTunnelJumpsMethod = jest
                .spyOn(controller, 'syncJumpItemsProtocolTunnelJumps')
                .mockResolvedValue(expectedResult);
            const syncJumpItemsRemoteRdpsMethod = jest
                .spyOn(controller, 'syncJumpItemsRemoteRdps')
                .mockResolvedValue(expectedResult);
            const syncJumpItemsRemoteVncsMethod = jest
                .spyOn(controller, 'syncJumpItemsRemoteVncs')
                .mockResolvedValue(expectedResult);
            const syncJumpItemsShellJumpsMethod = jest
                .spyOn(controller, 'syncJumpItemsShellJumps')
                .mockResolvedValue(expectedResult);
            const syncJumpItemsWebJumpsMethod = jest
                .spyOn(controller, 'syncJumpItemsWebJumps')
                .mockResolvedValue(expectedResult);

            const result = await controller.syncAll(123123);

            expect(syncUsersMethod).toHaveBeenCalledTimes(1);
            expect(syncTeamsMethod).toHaveBeenCalledTimes(1);
            expect(syncJumpClientsMethod).toHaveBeenCalledTimes(1);
            expect(syncJumpClientInstallersMethod).toHaveBeenCalledTimes(1);
            expect(syncGroupPoliciesMethod).toHaveBeenCalledTimes(1);
            expect(syncJumpPoliciesMethod).toHaveBeenCalledTimes(1);
            expect(syncJumpGroupsMethod).toHaveBeenCalledTimes(1);
            expect(syncJumpointsMethod).toHaveBeenCalledTimes(1);
            expect(syncJumpItemsProtocolTunnelJumpsMethod).toHaveBeenCalledTimes(1);
            expect(syncJumpItemsRemoteRdpsMethod).toHaveBeenCalledTimes(1);
            expect(syncJumpItemsRemoteVncsMethod).toHaveBeenCalledTimes(1);
            expect(syncJumpItemsShellJumpsMethod).toHaveBeenCalledTimes(1);
            expect(syncJumpItemsWebJumpsMethod).toHaveBeenCalledTimes(1);
            expect(result).toHaveLength(13);
        });
    });

    describe('syncUsers', () => {
        it('should return sync comparison overview for users', async () => {
            const expectedResult = {
                tenantId: 123,
                syncEntityType: SyncEntityType.User,
                totalBtData: 10,
                totalDbData: 8,
                identicalDataIds: [1, 2],
                onlyInBtIds: [3, 4],
                onlyInDbIds: [5],
                differentDataIds: [6, 7],
            };

            commandBus.execute = jest.fn().mockResolvedValue(expectedResult);

            const result = await controller.syncUsers(123);

            expect(result).toEqual(expectedResult);
        });
    });

    describe('syncTeams', () => {
        it('should return sync comparison overview for teams', async () => {
            const expectedResult = {
                tenantId: 123,
                syncEntityType: SyncEntityType.Team,
                totalBtData: 5,
                totalDbData: 4,
                identicalDataIds: [1],
                onlyInBtIds: [2],
                onlyInDbIds: [3],
                differentDataIds: [4],
            };

            commandBus.execute = jest.fn().mockResolvedValue(expectedResult);

            const result = await controller.syncTeams(123);

            expect(result).toEqual(expectedResult);
        });
    });

    describe('syncJumpClients', () => {
        it('should return sync comparison overview for jump clients', async () => {
            const expectedResult = {
                tenantId: 123,
                syncEntityType: SyncEntityType.JumpClient,
                totalBtData: 3,
                totalDbData: 2,
                identicalDataIds: [1],
                onlyInBtIds: [2],
                onlyInDbIds: [],
                differentDataIds: [3],
            };

            commandBus.execute = jest.fn().mockResolvedValue(expectedResult);

            const result = await controller.syncJumpClients(123);

            expect(result).toEqual(expectedResult);
        });
    });

    describe('syncJumpClientInstallers', () => {
        it('should return sync comparison overview for jump client installers', async () => {
            const expectedResult = {
                tenantId: 123,
                syncEntityType: SyncEntityType.JumpClientInstaller,
                totalBtData: 2,
                totalDbData: 1,
                identicalDataIds: [1],
                onlyInBtIds: [2],
                onlyInDbIds: [],
                differentDataIds: [],
            };

            commandBus.execute = jest.fn().mockResolvedValue(expectedResult);

            const result = await controller.syncJumpClientInstallers(123);

            expect(result).toEqual(expectedResult);
        });
    });

    describe('syncGroupPolicies', () => {
        it('should return sync comparison overview for group policies', async () => {
            const expectedResult = {
                tenantId: 123,
                syncEntityType: SyncEntityType.GroupPolicy,
                totalBtData: 7,
                totalDbData: 6,
                identicalDataIds: [1, 2, 3],
                onlyInBtIds: [4],
                onlyInDbIds: [5],
                differentDataIds: [6, 7],
            };

            commandBus.execute = jest.fn().mockResolvedValue(expectedResult);

            const result = await controller.syncGroupPolicies(123);

            expect(result).toEqual(expectedResult);
        });
    });

    describe('syncJumpPolicies', () => {
        it('should return sync comparison overview for jump policies', async () => {
            const expectedResult = {
                tenantId: 123,
                syncEntityType: SyncEntityType.JumpPolicy,
                totalBtData: 4,
                totalDbData: 3,
                identicalDataIds: [1, 2],
                onlyInBtIds: [3],
                onlyInDbIds: [],
                differentDataIds: [4],
            };

            commandBus.execute = jest.fn().mockResolvedValue(expectedResult);

            const result = await controller.syncJumpPolicies(123);

            expect(result).toEqual(expectedResult);
        });
    });

    describe('syncJumpGroups', () => {
        it('should return sync comparison overview for jump groups', async () => {
            const expectedResult = {
                tenantId: 123,
                syncEntityType: SyncEntityType.JumpGroup,
                totalBtData: 6,
                totalDbData: 5,
                identicalDataIds: [1, 2, 3],
                onlyInBtIds: [4],
                onlyInDbIds: [5],
                differentDataIds: [6],
            };

            commandBus.execute = jest.fn().mockResolvedValue(expectedResult);

            const result = await controller.syncJumpGroups(123);

            expect(result).toEqual(expectedResult);
        });
    });

    describe('syncJumpoints', () => {
        it('should return sync comparison overview for jumpoints', async () => {
            const expectedResult = {
                tenantId: 123,
                syncEntityType: SyncEntityType.Jumpoint,
                totalBtData: 8,
                totalDbData: 7,
                identicalDataIds: [1, 2, 3, 4],
                onlyInBtIds: [5],
                onlyInDbIds: [6],
                differentDataIds: [7, 8],
            };

            commandBus.execute = jest.fn().mockResolvedValue(expectedResult);

            const result = await controller.syncJumpoints(123);

            expect(result).toEqual(expectedResult);
        });
    });

    describe('syncJumpItemsProtocolTunnelJumps', () => {
        it('should return sync comparison overview for jump items protocol tunnel jumps', async () => {
            const expectedResult = {
                tenantId: 123,
                syncEntityType: SyncEntityType.JumpItemProtocolTunnelJump,
                totalBtData: 3,
                totalDbData: 2,
                identicalDataIds: [1],
                onlyInBtIds: [2],
                onlyInDbIds: [],
                differentDataIds: [3],
            };

            commandBus.execute = jest.fn().mockResolvedValue(expectedResult);

            const result = await controller.syncJumpItemsProtocolTunnelJumps(123);

            expect(result).toEqual(expectedResult);
        });
    });

    describe('syncJumpItemsRemoteRdps', () => {
        it('should return sync comparison overview for jump items remote rdps', async () => {
            const expectedResult = {
                tenantId: 123,
                syncEntityType: SyncEntityType.JumpItemRemoteRdp,
                totalBtData: 5,
                totalDbData: 4,
                identicalDataIds: [1, 2],
                onlyInBtIds: [3],
                onlyInDbIds: [4],
                differentDataIds: [5],
            };

            commandBus.execute = jest.fn().mockResolvedValue(expectedResult);

            const result = await controller.syncJumpItemsRemoteRdps(123);

            expect(result).toEqual(expectedResult);
        });
    });

    describe('syncJumpItemsRemoteVncs', () => {
        it('should return sync comparison overview for jump items remote vncs', async () => {
            const expectedResult = {
                tenantId: 123,
                syncEntityType: SyncEntityType.JumpItemRemoteVnc,
                totalBtData: 2,
                totalDbData: 1,
                identicalDataIds: [1],
                onlyInBtIds: [2],
                onlyInDbIds: [],
                differentDataIds: [],
            };

            commandBus.execute = jest.fn().mockResolvedValue(expectedResult);

            const result = await controller.syncJumpItemsRemoteVncs(123);

            expect(result).toEqual(expectedResult);
        });
    });

    describe('syncJumpItemsShellJumps', () => {
        it('should return sync comparison overview for jump items shell jumps', async () => {
            const expectedResult = {
                tenantId: 123,
                syncEntityType: SyncEntityType.JumpItemShellJump,
                totalBtData: 4,
                totalDbData: 3,
                identicalDataIds: [1, 2],
                onlyInBtIds: [3],
                onlyInDbIds: [],
                differentDataIds: [4],
            };

            commandBus.execute = jest.fn().mockResolvedValue(expectedResult);

            const result = await controller.syncJumpItemsShellJumps(123);

            expect(result).toEqual(expectedResult);
        });
    });

    describe('syncJumpItemsWebJumps', () => {
        it('should return sync comparison overview for jump items web jumps', async () => {
            const expectedResult = {
                tenantId: 123,
                syncEntityType: SyncEntityType.JumpItemWebJump,
                totalBtData: 6,
                totalDbData: 5,
                identicalDataIds: [1, 2, 3],
                onlyInBtIds: [4],
                onlyInDbIds: [5],
                differentDataIds: [6],
            };

            commandBus.execute = jest.fn().mockResolvedValue(expectedResult);

            const result = await controller.syncJumpItemsWebJumps(123);

            expect(result).toEqual(expectedResult);
        });
    });
});

function mockAppConfigService() {
    return {
        sync: {
            cronJobRetryAttempts: 3,
            cronJobRetryDelayInMs: 1000,
        },
    } as AppConfigService;
}

function mockCommandBus() {
    const commandBus = {} as CommandBus;

    commandBus.execute = jest.fn();

    return commandBus;
}
