import { EventBus, QueryBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { TeamUserRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/team/dtos/outputs';
import { UserTeamRoleType as BTUserTeamRoleType } from '../../../beyondtrust-pra-conf-api/team/enums';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { TeamEntity } from '../../../team/repositories/entities';
import { UserEntity } from '../../../user/repositories/entities';
import { UserTeamRoleType } from '../../enums';
import { TeamUsersSyncFailedEvent, TeamUsersSyncedEvent } from '../../events';
import { TeamUserEntity } from '../../repositories/entities';
import { TeamUserRepositoryService } from '../../repositories/services/team-user-repository.service';
import { SyncTeamUsersAfterTeamsSyncedCommand } from '../sync-team-users-after-teams-synced.command';
import { SyncTeamUsersAfterTeamsSyncedCommandHandler } from './sync-team-users-after-users-synced.command-handler';

// TODO this unit tests are too complex. Simplify by creating a query from BT side (RetrieveAllTeamUsersQuery)
abstract class TestHelper {
    public static generateMockedTeamUserRetrievedDtoOutputs(ids: number[]): TeamUserRetrievedDtoOutput[] {
        return ids.map((id) => ({
            teamId: id,
            userId: id,
            role: BTUserTeamRoleType.Lead,
        }));
    }

    public static generateMockedUserEntities(ids: number[]): TeamUserEntity[] {
        return ids.map((id) => ({
            teamId: id,
            userId: id,
            team: { id: id } as TeamEntity,
            user: { id: id } as UserEntity,
            roleType: UserTeamRoleType.Lead,
            lastSyncDate: new Date('2025-01-01T00:00:00Z'),
        }));
    }
}

describe('SyncTeamUsersAfterTeamsSyncedCommandHandler', () => {
    let appConfigService: AppConfigService;
    let queryBus: QueryBus;
    let eventBus: EventBus;
    let teamUserRepositoryService: TeamUserRepositoryService;
    let handler: SyncTeamUsersAfterTeamsSyncedCommandHandler;

    beforeEach(() => {
        mockUserEntityCreateMethod();
        appConfigService = mockAppConfigService();
        queryBus = mockQueryBus();
        eventBus = mockEventBus();
        teamUserRepositoryService = mockUserRepositoryService();
        handler = new SyncTeamUsersAfterTeamsSyncedCommandHandler(
            queryBus,
            eventBus,
            appConfigService,
            teamUserRepositoryService,
        );
    });

    describe('execute', () => {
        it('should publish an event and not throw an error when BT retrieval data fails', async () => {
            const error = new Error('Test error');
            const eventBusPublish = jest.spyOn(eventBus, 'publish');
            ErrorProcessorUtility.stringify = jest.fn().mockReturnValue('Test error');

            queryBus.execute = jest.fn().mockRejectedValue(error);

            await handler.execute(
                new SyncTeamUsersAfterTeamsSyncedCommand('transaction-1', [1, 2], [3, 4, 5], [6, 7, 8, 9]),
            );

            expect(eventBusPublish).toHaveBeenCalledTimes(5);
            expect(eventBusPublish).toHaveBeenCalledWith(
                expect.objectContaining(<TeamUsersSyncFailedEvent>{
                    eventType: TeamUsersSyncFailedEvent.EVENT_TYPE,
                    transactionId: 'transaction-1',
                    payload: {
                        errorMessage: 'Test error',
                    },
                }),
            );
        });

        it('should publish an event and not throw an error when deleting team ids from repository fails', async () => {
            const error = new Error('Test error');
            const eventBusPublish = jest.spyOn(eventBus, 'publish');
            ErrorProcessorUtility.stringify = jest.fn().mockReturnValue('Test error');

            teamUserRepositoryService.deleteByTeamIds = jest.fn().mockRejectedValue(error);

            await handler.execute(new SyncTeamUsersAfterTeamsSyncedCommand('transaction-1', [], [], [6, 7, 8, 9]));

            expect(eventBusPublish).toHaveBeenCalledTimes(1);
            expect(eventBusPublish).toHaveBeenCalledWith(
                expect.objectContaining(<TeamUsersSyncFailedEvent>{
                    eventType: TeamUsersSyncFailedEvent.EVENT_TYPE,
                    transactionId: 'transaction-1',
                    payload: {
                        errorMessage: 'Test error',
                    },
                }),
            );
        });

        it.each([
            {
                queryBusExecuteResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedTeamUserRetrievedDtoOutputs([1, 2]))
                    .mockResolvedValueOnce(TestHelper.generateMockedTeamUserRetrievedDtoOutputs([3, 4]))
                    .mockResolvedValue(TestHelper.generateMockedTeamUserRetrievedDtoOutputs([3, 4])), // BT return repeating data when pagination limit is exceeded
                expectedUserRepositoryServiceDeleteByTeamIdCall: [
                    {
                        iter: 1,
                        id: 1,
                    },
                    {
                        iter: 2,
                        id: 2,
                    },
                    {
                        iter: 3,
                        id: 3,
                    },
                    {
                        iter: 4,
                        id: 4,
                    },
                ],
                expectedUserRepositoryServiceDeleteByTeamIdsCall: [
                    {
                        iter: 1,
                        ids: [5, 6, 7, 8],
                    },
                ],
            },
        ])(
            'should return, call method and publish event as expected',
            async ({
                queryBusExecuteResolvedValue,
                expectedUserRepositoryServiceDeleteByTeamIdCall,
                expectedUserRepositoryServiceDeleteByTeamIdsCall,
            }) => {
                queryBus.execute = queryBusExecuteResolvedValue;
                const teamUserRepositoryServiceCreateOrUpdateByTeamIdAndUserId = jest.spyOn(
                    teamUserRepositoryService,
                    'createOrUpdateByTeamIdAndUserId',
                );
                const teamUserRepositoryServiceDeleteByTeamIds = jest.spyOn(
                    teamUserRepositoryService,
                    'deleteByTeamIds',
                );
                const teamUserRepositoryServiceDeleteByTeamId = jest.spyOn(teamUserRepositoryService, 'deleteByTeamId');
                const eventBusPublish = jest.spyOn(eventBus, 'publish');

                await handler.execute(
                    new SyncTeamUsersAfterTeamsSyncedCommand('transaction-1', [1, 2], [3, 4], [5, 6, 7, 8]),
                );

                expect(teamUserRepositoryServiceCreateOrUpdateByTeamIdAndUserId).toHaveBeenCalledTimes(4);
                expect(teamUserRepositoryServiceDeleteByTeamIds).toHaveBeenCalledTimes(
                    expectedUserRepositoryServiceDeleteByTeamIdsCall.length,
                );
                for (const item of expectedUserRepositoryServiceDeleteByTeamIdsCall) {
                    expect(teamUserRepositoryServiceDeleteByTeamIds).toHaveBeenNthCalledWith(item.iter, item.ids);
                }

                expect(teamUserRepositoryServiceDeleteByTeamId).toHaveBeenCalledTimes(
                    expectedUserRepositoryServiceDeleteByTeamIdCall.length,
                );
                for (const item of expectedUserRepositoryServiceDeleteByTeamIdCall) {
                    expect(teamUserRepositoryServiceDeleteByTeamId).toHaveBeenNthCalledWith(item.iter, item.id);
                }

                expect(eventBusPublish).toHaveBeenCalledTimes(4);
                expect(eventBusPublish).toHaveBeenCalledWith(
                    expect.objectContaining(<TeamUsersSyncedEvent>{
                        eventType: TeamUsersSyncedEvent.EVENT_TYPE,
                        transactionId: 'transaction-1',
                    }),
                );
            },
        );
    });
});

function mockUserEntityCreateMethod() {
    TeamUserEntity.create = jest.fn().mockImplementation((id: number) => {
        return TestHelper.generateMockedUserEntities([id])[0];
    });
}

function mockAppConfigService(): AppConfigService {
    const service = {
        sync: {
            maxBatchSize: 2,
        },
    } as AppConfigService;

    return service;
}

function mockQueryBus(): QueryBus {
    const queryBus = {} as QueryBus;
    queryBus.execute = jest.fn().mockResolvedValue([]);

    return queryBus;
}

function mockEventBus(): EventBus {
    const eventBus = {} as EventBus;
    eventBus.publish = jest.fn();

    return eventBus;
}

function mockUserRepositoryService(): TeamUserRepositoryService {
    const service = {} as TeamUserRepositoryService;
    service.createOrUpdateByTeamIdAndUserId = jest.fn();
    service.deleteByTeamId = jest.fn();
    service.deleteByTeamIds = jest.fn();

    return service;
}
