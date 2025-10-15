import { EventBus, QueryBus } from '@nestjs/cqrs';
import { UserGroupPolicyRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/user/dtos/outputs';
import { RetrieveUserGroupPoliciesQuery as BTRetrieveUserGroupPoliciesQuery } from '../../../beyondtrust-pra-conf-api/user/queries';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { SyncUserGroupPoliciesAfterUsersSyncedCommand } from '../../../sync/commands/sync-user-group-policies-after-users-synced.command';
import { UserGroupPoliciesSyncedEvent, UserGroupPoliciesSyncFailedEvent } from '../../../user-group-policy/events';
import { UserGroupPolicyEntity } from '../../../user-group-policy/repositories/entities';
import { UserGroupPolicyRepositoryService } from '../../../user-group-policy/repositories/services/user-group-policy-repository.service';
import { SyncUserGroupPoliciesAfterUsersSyncedCommandHandler } from './sync-user-group-policies-after-users-synced.command-handler';

abstract class TestHelper {
    public static get mockedUserGroupPoliciesRetrievedDtoOutputs(): UserGroupPolicyRetrievedDtoOutput[] {
        return [
            {
                id: 1,
                name: 'User Group Policy 1',
            },
            {
                id: 2,
                name: 'User Group Policy 2',
            },
            {
                id: 3,
                name: 'User Group Policy 3',
            },
        ];
    }
}

describe('SyncUserGroupPoliciesAfterUsersSyncedCommandHandler', () => {
    let eventBus: EventBus;
    let queryBus: QueryBus;
    let userGroupPolicyRepositoryService: UserGroupPolicyRepositoryService;
    let handler: SyncUserGroupPoliciesAfterUsersSyncedCommandHandler;

    beforeEach(() => {
        eventBus = mockEventBus();
        queryBus = mockQueryBus();
        userGroupPolicyRepositoryService = mockUserGroupPolicyRepositoryService();
        handler = new SyncUserGroupPoliciesAfterUsersSyncedCommandHandler(
            queryBus,
            eventBus,
            userGroupPolicyRepositoryService,
        );
    });

    describe('execute', () => {
        it('should call the query bus and repository service with correct parameters and publish an event', async () => {
            // Arrange
            const queryBusExecuteMethod = jest.spyOn(queryBus, 'execute');
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

            const userGroupPolicyEntitiesToBeReplaced = [
                { userId: 123, groupPolicyId: 1 },
                { userId: 123, groupPolicyId: 2 },
                { userId: 123, groupPolicyId: 3 },
            ] as UserGroupPolicyEntity[];
            const userGroupPolicyEntityCreateMethod = jest
                .spyOn(UserGroupPolicyEntity, 'create')
                .mockReturnValue(userGroupPolicyEntitiesToBeReplaced);

            const userGroupPolicyRepositoryServiceDeleteByUserIdsMethod = jest
                .spyOn(userGroupPolicyRepositoryService, 'deleteByUserIds')
                .mockResolvedValue(Promise.resolve());
            const userGroupPolicyRepositoryServiceDeleteByUserIdMethod = jest
                .spyOn(userGroupPolicyRepositoryService, 'deleteByUserId')
                .mockResolvedValue(Promise.resolve());
            const userGroupPolicyRepositoryServiceCreateOrUpdateByUserIdAndGroupPolicyIdMethod = jest
                .spyOn(userGroupPolicyRepositoryService, 'createOrUpdateByUserIdAndGroupPolicyId')
                .mockResolvedValue(Promise.resolve());

            // Act
            await handler.execute(
                new SyncUserGroupPoliciesAfterUsersSyncedCommand('transaction-1', 123, [1, 2], [3, 4], [5, 6]),
            );

            // Assert
            // createdUserIds: [1, 2]
            // updatedUserIds: [3, 4]
            for (let n = 1; n <= 4; n++) {
                expect(queryBusExecuteMethod).toHaveBeenNthCalledWith(
                    n,
                    new BTRetrieveUserGroupPoliciesQuery('transaction-1', 123, n),
                );
                expect(userGroupPolicyEntityCreateMethod).toHaveBeenNthCalledWith(n, n, [1, 2, 3]);
                expect(userGroupPolicyRepositoryServiceDeleteByUserIdMethod).toHaveBeenNthCalledWith(n, 123, n);
                expect(
                    userGroupPolicyRepositoryServiceCreateOrUpdateByUserIdAndGroupPolicyIdMethod,
                ).toHaveBeenCalledWith(123, userGroupPolicyEntitiesToBeReplaced);
                expect(eventBusPublishMethod).toHaveBeenNthCalledWith(
                    n,
                    expect.objectContaining(<UserGroupPoliciesSyncedEvent>{
                        transactionId: 'transaction-1',
                        eventType: UserGroupPoliciesSyncedEvent.EVENT_TYPE,
                        payload: {
                            userGroupPolicies: [
                                {
                                    userId: n,
                                    groupPolicyId: 1,
                                },
                                {
                                    userId: n,
                                    groupPolicyId: 2,
                                },
                                {
                                    userId: n,
                                    groupPolicyId: 3,
                                },
                            ],
                            tenantId: 123,
                        },
                    }),
                );
            }

            // deletedUserIds: [5, 6]
            expect(userGroupPolicyRepositoryServiceDeleteByUserIdsMethod).toHaveBeenCalledTimes(1);
            expect(userGroupPolicyRepositoryServiceDeleteByUserIdsMethod).toHaveBeenCalledWith(123, [5, 6]);
        });

        it('should publish an event and not throw error when failure occurs', async () => {
            // Arrange
            queryBus.execute = jest.fn().mockRejectedValue(new Error('Error'));
            userGroupPolicyRepositoryService.deleteByUserIds = jest.fn().mockRejectedValue(new Error('Error'));
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            ErrorProcessorUtility.stringify = jest.fn().mockReturnValue('Error message');

            // Act
            await handler.execute(
                new SyncUserGroupPoliciesAfterUsersSyncedCommand('transaction-1', 123, [1, 2], [3, 4, 5], [5, 6, 7, 8]),
            );

            // Assert
            expect(eventBusPublishMethod).toHaveBeenCalledTimes(6);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining(<UserGroupPoliciesSyncFailedEvent>{
                    eventType: UserGroupPoliciesSyncFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'Error message',
                        tenantId: 123,
                    },
                }),
            );
        });
    });
});

function mockEventBus() {
    const eventBus = {} as EventBus;
    eventBus.publish = jest.fn();

    return eventBus;
}

function mockQueryBus() {
    const queryBus = {} as QueryBus;
    queryBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedUserGroupPoliciesRetrievedDtoOutputs);

    return queryBus;
}

function mockUserGroupPolicyRepositoryService() {
    const userGroupPolicyRepositoryService = {} as UserGroupPolicyRepositoryService;
    userGroupPolicyRepositoryService.createOrUpdateByUserIdAndGroupPolicyId = jest.fn();
    userGroupPolicyRepositoryService.deleteByUserId = jest.fn();
    userGroupPolicyRepositoryService.deleteByUserIds = jest.fn();

    return userGroupPolicyRepositoryService;
}
