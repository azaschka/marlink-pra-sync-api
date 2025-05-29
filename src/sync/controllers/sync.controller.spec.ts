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
});

function mockCommandBus() {
    const commandBus = {} as CommandBus;

    commandBus.execute = jest.fn();

    return commandBus;
}
