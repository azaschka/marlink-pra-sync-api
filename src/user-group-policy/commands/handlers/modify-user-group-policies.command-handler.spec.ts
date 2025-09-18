import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { ModifyUserGroupPoliciesCommand as BTModifyUserGroupPoliciesCommand } from '../../../beyondtrust-pra-conf-api/user/commands';
import {
    UserGroupPoliciesModifiedDtoOutput,
    UserGroupPolicyRetrievedDtoOutput,
} from '../../../beyondtrust-pra-conf-api/user/dtos/outputs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { UserGroupPoliciesModificationFailedEvent, UserGroupPoliciesModifiedEvent } from '../../events';
import { UserGroupPolicyEntity } from '../../repositories/entities';
import { UserGroupPolicyRepositoryService } from '../../repositories/services/user-group-policy-repository.service';
import { ModifyUserGroupPoliciesCommand } from '../modify-user-group-policies.command';
import { ModifyUserGroupPoliciesCommandHandler } from './modify-user-group-policies.command-handler';

abstract class TestHelper {
    public static get mockedUserGroupPoliciesModifiedDtoOutput(): UserGroupPoliciesModifiedDtoOutput {
        return {
            message: 'User group policies modified successfully',
        };
    }

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

describe('ModifyUserGroupPoliciesCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let queryBus: QueryBus;
    let userGroupPolicyRepositoryService: UserGroupPolicyRepositoryService;
    let handler: ModifyUserGroupPoliciesCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        queryBus = mockQueryBus();
        userGroupPolicyRepositoryService = mockUserGroupPolicyRepositoryService();
        handler = new ModifyUserGroupPoliciesCommandHandler(
            commandBus,
            queryBus,
            eventBus,
            userGroupPolicyRepositoryService,
        );
    });

    describe('execute', () => {
        it('should call the command bus and repository service with correct parameters, publish an event and return the result', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

            const userGroupPolicyEntitiesToBeReplaced = [
                { userId: 123, groupPolicyId: 1, lastSyncDate: new Date('2025-01-01') },
                { userId: 123, groupPolicyId: 2, lastSyncDate: new Date('2025-01-01') },
                { userId: 123, groupPolicyId: 3, lastSyncDate: new Date('2025-01-01') },
            ] as UserGroupPolicyEntity[];
            const userGroupPolicyEntityCreateMethod = jest
                .spyOn(UserGroupPolicyEntity, 'create')
                .mockReturnValue(userGroupPolicyEntitiesToBeReplaced);

            const userGroupPolicyRepositoryServiceDeleteByUserIdMethod = jest
                .spyOn(userGroupPolicyRepositoryService, 'deleteByUserId')
                .mockResolvedValue(Promise.resolve());
            const userGroupPolicyRepositoryServiceCreateOrUpdateByUserIdAndGroupPolicyIdMethod = jest
                .spyOn(userGroupPolicyRepositoryService, 'createOrUpdateByUserIdAndGroupPolicyId')
                .mockResolvedValue(Promise.resolve());

            // Act
            const result = await handler.execute(
                new ModifyUserGroupPoliciesCommand('transaction-1', 100, 123, [1, 2, 3], [4, 5, 6]),
            );

            // Assert
            expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                new BTModifyUserGroupPoliciesCommand('transaction-1', 123, [1, 2, 3], [4, 5, 6]),
            );
            expect(userGroupPolicyEntityCreateMethod).toHaveBeenCalledWith(123, [1, 2, 3]);
            expect(userGroupPolicyRepositoryServiceDeleteByUserIdMethod).toHaveBeenCalledWith(100, 123);
            expect(userGroupPolicyRepositoryServiceCreateOrUpdateByUserIdAndGroupPolicyIdMethod).toHaveBeenCalledWith(
                100,
                userGroupPolicyEntitiesToBeReplaced,
            );
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining(<UserGroupPoliciesModifiedEvent>{
                    transactionId: 'transaction-1',
                    eventType: UserGroupPoliciesModifiedEvent.EVENT_TYPE,
                    payload: {
                        userGroupPolicies: result,
                    },
                }),
            );
            expect(result).toStrictEqual([
                {
                    userId: 123,
                    groupPolicyId: 1,
                    lastSyncDate: new Date('2025-01-01'),
                },
                {
                    userId: 123,
                    groupPolicyId: 2,
                    lastSyncDate: new Date('2025-01-01'),
                },
                {
                    userId: 123,
                    groupPolicyId: 3,
                    lastSyncDate: new Date('2025-01-01'),
                },
            ]);
        });

        it('should throw an error if the command bus fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute').mockRejectedValue(new Error('Error'));

            // Act & Assert
            await expect(
                handler.execute(new ModifyUserGroupPoliciesCommand('transaction-1', 100, 123, [1, 2, 3], [4, 5, 6])),
            ).rejects.toThrow('Error');
            expect(commandBusExecuteMethod).toHaveBeenCalled();
        });

        it('should throw an error and publish an event if the repository service fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const userGroupPolicyEntitiesToBeReplaced = [{ userId: 1 }, { userId: 2 }] as UserGroupPolicyEntity[];
            const userGroupPolicyEntityCreateMethod = jest
                .spyOn(UserGroupPolicyEntity, 'create')
                .mockReturnValue(userGroupPolicyEntitiesToBeReplaced);
            const expectedError = new Error('Error');
            const userGroupPolicyRepositoryServiceCreateOrUpdateByUserIdAndGroupPolicyIdMethod = jest
                .spyOn(userGroupPolicyRepositoryService, 'createOrUpdateByUserIdAndGroupPolicyId')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(new ModifyUserGroupPoliciesCommand('transaction-1', 100, 123, [1, 2, 3], [4, 5, 6])),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(userGroupPolicyEntityCreateMethod).toHaveBeenCalled();
            expect(userGroupPolicyRepositoryServiceCreateOrUpdateByUserIdAndGroupPolicyIdMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: UserGroupPoliciesModificationFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        userId: 123,
                        groupPolicyIdsToAdd: [1, 2, 3],
                        groupPolicyIdsToRemove: [4, 5, 6],
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

function mockCommandBus() {
    const commandBus = {} as CommandBus;
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedUserGroupPoliciesModifiedDtoOutput);

    return commandBus;
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

    return userGroupPolicyRepositoryService;
}
