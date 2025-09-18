import { EventBus, QueryBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { TeamRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/team/dtos/outputs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { TeamsSyncedEvent, TeamsSyncFailedEvent } from '../../events';
import { TeamEntity } from '../../repositories/entities';
import { TeamRepositoryService } from '../../repositories/services/team-repository.service';
import { SyncTeamsCommand } from '../sync-teams.command';
import { SyncTeamsCommandHandler } from './sync-teams.command-handler';

abstract class TestHelper {
    public static generateMockedTeamRetrievedDtoOutputs(ids: number[]): TeamRetrievedDtoOutput[] {
        return ids.map((id) => ({
            id,
            name: `team-${id}`,
        }));
    }

    public static generateMockedTeamEntities(ids: number[]): TeamEntity[] {
        return ids.map((id) => ({
            id,
            name: `team-${id}`,
            teamUsers: [],
            groupPolicyTeams: [],
            lastSyncDate: new Date('2025-01-01T00:00:00Z'),
        }));
    }
}

describe('SyncTeamsCommandHandler', () => {
    let appConfigService: AppConfigService;
    let queryBus: QueryBus;
    let eventBus: EventBus;
    let teamRepositoryService: TeamRepositoryService;
    let handler: SyncTeamsCommandHandler;

    beforeEach(() => {
        mockTeamEntityCreateMethod();
        appConfigService = mockAppConfigService();
        queryBus = mockQueryBus();
        eventBus = mockEventBus();
        teamRepositoryService = mockTeamRepositoryService();
        handler = new SyncTeamsCommandHandler(appConfigService, queryBus, eventBus, teamRepositoryService);
    });

    describe('execute', () => {
        it('should publish an event and throw an error when an error occurs', async () => {
            const error = new Error('Test error');
            const eventBusPublish = jest.spyOn(eventBus, 'publish');
            ErrorProcessorUtility.stringify = jest.fn().mockReturnValue('Test error');

            queryBus.execute = jest.fn().mockRejectedValue(error);

            await expect(handler.execute(new SyncTeamsCommand('transaction-1', 123))).rejects.toThrow(error);

            expect(eventBusPublish).toHaveBeenCalledWith(
                expect.objectContaining(<TeamsSyncFailedEvent>{
                    eventType: TeamsSyncFailedEvent.EVENT_TYPE,
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
                    .mockResolvedValueOnce(TestHelper.generateMockedTeamRetrievedDtoOutputs([1, 2]))
                    .mockResolvedValueOnce(TestHelper.generateMockedTeamRetrievedDtoOutputs([3, 4]))
                    .mockResolvedValue(TestHelper.generateMockedTeamRetrievedDtoOutputs([3, 4])), // BT return repeating data when pagination limit is exceeded
                teamRepositoryFindByLastSyncDateBeforeResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedTeamEntities([5, 6]))
                    .mockResolvedValueOnce(TestHelper.generateMockedTeamEntities([7, 8]))
                    .mockResolvedValue(TestHelper.generateMockedTeamEntities([])),
                teamRepositoryServiceFindByIdsResolvedValue: jest
                    .fn()
                    .mockResolvedValue(TestHelper.generateMockedTeamEntities([1, 3])),
                expectedTeamRepositoryServiceFindByIdsCall: [
                    {
                        iter: 1,
                        ids: [1, 2],
                    },
                    {
                        iter: 2,
                        ids: [3, 4],
                    },
                ],
                expectedTeamRepositoryServiceCreateOrUpdateByIdsCall: [
                    {
                        iter: 1,
                        entity: TestHelper.generateMockedTeamEntities([2]),
                    },
                    {
                        iter: 2,
                        entity: TestHelper.generateMockedTeamEntities([1]),
                    },
                    {
                        iter: 3,
                        entity: TestHelper.generateMockedTeamEntities([4]),
                    },
                    {
                        iter: 4,
                        entity: TestHelper.generateMockedTeamEntities([3]),
                    },
                ],
                expectedTeamRepositoryServiceDeleteByIdsCall: [
                    {
                        iter: 1,
                        ids: [5, 6],
                    },
                    {
                        iter: 2,
                        ids: [7, 8],
                    },
                ],
                expectedResult: {
                    createdTeamIds: [2, 4],
                    updatedTeamIds: [1, 3],
                    deletedTeamIds: [5, 6, 7, 8],
                },
            },
            {
                queryBusExecuteResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedTeamRetrievedDtoOutputs([1, 2]))
                    .mockResolvedValue(TestHelper.generateMockedTeamRetrievedDtoOutputs([3])),
                teamRepositoryFindByLastSyncDateBeforeResolvedValue: jest
                    .fn()
                    .mockResolvedValueOnce(TestHelper.generateMockedTeamEntities([5, 6]))
                    .mockResolvedValueOnce(TestHelper.generateMockedTeamEntities([7])),
                teamRepositoryServiceFindByIdsResolvedValue: jest
                    .fn()
                    .mockResolvedValue(TestHelper.generateMockedTeamEntities([1, 3])),
                expectedTeamRepositoryServiceFindByIdsCall: [
                    {
                        iter: 1,
                        ids: [1, 2],
                    },
                    {
                        iter: 2,
                        ids: [3],
                    },
                ],
                expectedTeamRepositoryServiceCreateOrUpdateByIdsCall: [
                    {
                        iter: 1,
                        entity: TestHelper.generateMockedTeamEntities([2]),
                    },
                    {
                        iter: 2,
                        entity: TestHelper.generateMockedTeamEntities([1]),
                    },
                    {
                        iter: 3,
                        entity: TestHelper.generateMockedTeamEntities([3]),
                    },
                ],
                expectedTeamRepositoryServiceDeleteByIdsCall: [
                    {
                        iter: 1,
                        ids: [5, 6],
                    },
                    {
                        iter: 2,
                        ids: [7],
                    },
                ],
                expectedResult: {
                    createdTeamIds: [2],
                    updatedTeamIds: [1, 3],
                    deletedTeamIds: [5, 6, 7],
                },
            },
        ])(
            'should return, call method and publish event as expected',
            async ({
                queryBusExecuteResolvedValue,
                teamRepositoryFindByLastSyncDateBeforeResolvedValue,
                teamRepositoryServiceFindByIdsResolvedValue,
                expectedTeamRepositoryServiceFindByIdsCall,
                expectedTeamRepositoryServiceCreateOrUpdateByIdsCall,
                expectedTeamRepositoryServiceDeleteByIdsCall,
                expectedResult,
            }) => {
                queryBus.execute = queryBusExecuteResolvedValue;
                teamRepositoryService.findByLastSyncDateBefore = teamRepositoryFindByLastSyncDateBeforeResolvedValue;
                const teamRepositoryServiceFindByIds = jest
                    .spyOn(teamRepositoryService, 'findByIds')
                    .mockImplementation(teamRepositoryServiceFindByIdsResolvedValue);
                const teamRepositoryServiceCreateOrUpdateByIds = jest.spyOn(
                    teamRepositoryService,
                    'createOrUpdateByIds',
                );
                const teamRepositoryServiceDeleteByIds = jest.spyOn(teamRepositoryService, 'deleteByIds');
                const eventBusPublish = jest.spyOn(eventBus, 'publish');

                const result = await handler.execute(new SyncTeamsCommand('transaction-1', 123));

                expect(teamRepositoryServiceFindByIds).toHaveBeenCalledTimes(
                    expectedTeamRepositoryServiceFindByIdsCall.length,
                );
                for (const item of expectedTeamRepositoryServiceFindByIdsCall) {
                    expect(teamRepositoryServiceFindByIds).toHaveBeenNthCalledWith(item.iter, 123, item.ids);
                }

                expect(teamRepositoryServiceCreateOrUpdateByIds).toHaveBeenCalledTimes(
                    expectedTeamRepositoryServiceCreateOrUpdateByIdsCall.length,
                );
                for (const item of expectedTeamRepositoryServiceCreateOrUpdateByIdsCall) {
                    expect(teamRepositoryServiceCreateOrUpdateByIds).toHaveBeenNthCalledWith(
                        item.iter,
                        123,
                        item.entity,
                    );
                }

                expect(teamRepositoryServiceDeleteByIds).toHaveBeenCalledTimes(
                    expectedTeamRepositoryServiceDeleteByIdsCall.length,
                );
                for (const item of expectedTeamRepositoryServiceDeleteByIdsCall) {
                    expect(teamRepositoryServiceDeleteByIds).toHaveBeenNthCalledWith(item.iter, 123, item.ids);
                }

                expect(result).toEqual(expectedResult);

                expect(eventBusPublish).toHaveBeenCalledWith(
                    expect.objectContaining(<TeamsSyncedEvent>{
                        eventType: TeamsSyncedEvent.EVENT_TYPE,
                        transactionId: 'transaction-1',
                        payload: {
                            createdTeamIds: expectedResult.createdTeamIds,
                            updatedTeamIds: expectedResult.updatedTeamIds,
                            deletedTeamIds: expectedResult.deletedTeamIds,
                        },
                    }),
                );
            },
        );
    });
});

function mockTeamEntityCreateMethod() {
    TeamEntity.create = jest.fn().mockImplementation((id: number) => {
        return TestHelper.generateMockedTeamEntities([id])[0];
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
    queryBus.execute = jest.fn();

    return queryBus;
}

function mockEventBus(): EventBus {
    const eventBus = {} as EventBus;
    eventBus.publish = jest.fn();

    return eventBus;
}

function mockTeamRepositoryService(): TeamRepositoryService {
    const service = {} as TeamRepositoryService;
    service.findByIds = jest.fn();
    service.createOrUpdateByIds = jest.fn();
    service.findByLastSyncDateBefore = jest.fn();
    service.deleteByIds = jest.fn();

    return service;
}
