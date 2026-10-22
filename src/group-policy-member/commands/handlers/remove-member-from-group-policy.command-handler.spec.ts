import { CommandBus, EventBus } from '@nestjs/cqrs';
import { RemoveMemberFromGroupPolicyCommand as BTRemoveMemberFromGroupPolicyCommand } from '../../../beyondtrust-pra-conf-api/group-policy/commands';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { UserGroupPolicyService } from '../../../user-group-policy/services/user-group-policy.service';
import { GroupPolicyMemberRemovalFailedEvent, GroupPolicyMemberRemovedEvent } from '../../events';
import { GroupPolicyMemberEntity } from '../../repositories/entities';
import { GroupPolicyMemberRepositoryService } from '../../repositories/services/group-policy-member-repository.service';
import { RemoveMemberFromGroupPolicyCommand } from '../remove-member-from-group-policy.command';
import { RemoveMemberFromGroupPolicyCommandHandler } from './remove-member-from-group-policy.command-handler';

describe('RemoveMemberFromGroupPolicyCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let groupPolicyMemberRepositoryService: GroupPolicyMemberRepositoryService;
    let userGroupPolicyService: UserGroupPolicyService;
    let createOrUpdateUserGroupPolicy: jest.Mock;
    let deleteUserGroupPolicy: jest.Mock;
    let handler: RemoveMemberFromGroupPolicyCommandHandler;

    beforeEach(() => {
        jest.restoreAllMocks();
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        groupPolicyMemberRepositoryService = mockGroupPolicyMemberRepositoryService();
        createOrUpdateUserGroupPolicy = jest.fn().mockResolvedValue(undefined);
        deleteUserGroupPolicy = jest.fn().mockResolvedValue(undefined);
        userGroupPolicyService = {
            createOrUpdateByUserIdAndGroupPolicyId: createOrUpdateUserGroupPolicy,
            deleteByUserIdAndGroupPolicyId: deleteUserGroupPolicy,
        } as unknown as UserGroupPolicyService;
        handler = new RemoveMemberFromGroupPolicyCommandHandler(
            commandBus,
            eventBus,
            groupPolicyMemberRepositoryService,
            userGroupPolicyService,
        );
    });

    describe('execute', () => {
        it.each([
            <RemoveMemberFromGroupPolicyCommand>{
                transactionId: 'transaction-1',
                tenantId: 123,
                id: 1,
                memberId: 2,
            },
            <RemoveMemberFromGroupPolicyCommand>{
                transactionId: 'transaction-2',
                tenantId: 123,
                id: 3,
                memberId: 4,
            },
        ])(
            'should call the command bus and repository service with correct parameters, publish an event and return the result',
            async (command) => {
                // Arrange
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
                const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
                const groupPolicyMemberRepositoryServiceDeleteByGroupPolicyIdAndMemberIdMethod = jest.spyOn(
                    groupPolicyMemberRepositoryService,
                    'deleteByGroupPolicyIdAndMemberId',
                );

                // Act
                await handler.execute(command);

                // Assert
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTRemoveMemberFromGroupPolicyCommand(
                        command.transactionId,
                        command.tenantId,
                        command.id,
                        command.memberId,
                    ),
                );
                expect(groupPolicyMemberRepositoryServiceDeleteByGroupPolicyIdAndMemberIdMethod).toHaveBeenCalledWith(
                    command.tenantId,
                    command.id,
                    command.memberId,
                );
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<GroupPolicyMemberRemovedEvent>{
                        transactionId: command.transactionId,
                        eventType: GroupPolicyMemberRemovedEvent.EVENT_TYPE,
                        payload: {
                            groupPolicyId: command.id,
                            memberId: command.memberId,
                            tenantId: 123,
                        },
                    }),
                );
            },
        );

        it('should throw an error if the command bus fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute').mockRejectedValue(new Error('Error'));

            // Act & Assert
            await expect(
                handler.execute(<RemoveMemberFromGroupPolicyCommand>{
                    transactionId: 'transaction-1',
                    id: 3,
                    memberId: 4,
                }),
            ).rejects.toThrow('Error');
            expect(commandBusExecuteMethod).toHaveBeenCalled();
        });

        it('should throw an error and publish an event if the repository service fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const expectedError = new Error('Error');
            const groupPolicyMemberRepositoryServiceDeleteByGroupPolicyIdAndMemberIdMethod = jest
                .spyOn(groupPolicyMemberRepositoryService, 'deleteByGroupPolicyIdAndMemberId')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<RemoveMemberFromGroupPolicyCommand>{
                    transactionId: 'transaction-1',
                    id: 3,
                    memberId: 4,
                    tenantId: 123,
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(groupPolicyMemberRepositoryServiceDeleteByGroupPolicyIdAndMemberIdMethod).toHaveBeenCalled();
            expect(deleteUserGroupPolicy).not.toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: GroupPolicyMemberRemovalFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        groupPolicyId: 3,
                        memberId: 4,
                        tenantId: 123,
                    },
                }),
            );
        });
    });

    describe('user group policy mirror (MARLINKPRA-80)', () => {
        const command = <RemoveMemberFromGroupPolicyCommand>{
            transactionId: 'transaction-1',
            tenantId: 123,
            id: 7,
            memberId: 70,
        };
        let findMember: jest.SpyInstance;
        let deleteMember: jest.SpyInstance;
        let publish: jest.SpyInstance;

        beforeEach(() => {
            findMember = jest
                .spyOn(groupPolicyMemberRepositoryService, 'findOneByGroupPolicyIdAndMemberId')
                .mockResolvedValue({ groupPolicyId: 7, memberId: 70, userId: 2 } as GroupPolicyMemberEntity);
            deleteMember = jest.spyOn(groupPolicyMemberRepositoryService, 'deleteByGroupPolicyIdAndMemberId');
            publish = jest.spyOn(eventBus, 'publish');
        });

        it('removes the user group policy of the member read from the mirror before the member row is deleted', async () => {
            const order: string[] = [];
            findMember.mockImplementation(() => {
                order.push('find');
                return Promise.resolve({ groupPolicyId: 7, memberId: 70, userId: 2 } as GroupPolicyMemberEntity);
            });
            deleteMember.mockImplementation(() => {
                order.push('delete member');
                return Promise.resolve();
            });

            await handler.execute(command);

            expect(findMember).toHaveBeenCalledWith(123, 7, 70);
            expect(order).toEqual(['find', 'delete member']);
            expect(deleteUserGroupPolicy).toHaveBeenCalledWith(123, 2, 7);
        });

        it('leaves the user group policy mirror alone when the member is not in the mirror', async () => {
            findMember.mockResolvedValue(null);

            await handler.execute(command);

            expect(deleteUserGroupPolicy).not.toHaveBeenCalled();
            expect(deleteMember).toHaveBeenCalledWith(123, 7, 70);
            expect(publish).toHaveBeenCalledWith(
                expect.objectContaining({ eventType: GroupPolicyMemberRemovedEvent.EVENT_TYPE }),
            );
        });

        it('leaves the user group policy mirror alone and still removes the member when the mirror read fails', async () => {
            const warn = jest.spyOn(console, 'warn').mockImplementation();
            findMember.mockRejectedValue(new Error('connection lost'));

            await handler.execute(command);

            expect(deleteUserGroupPolicy).not.toHaveBeenCalled();
            expect(deleteMember).toHaveBeenCalledWith(123, 7, 70);
            expect(publish).toHaveBeenCalledWith(
                expect.objectContaining({ eventType: GroupPolicyMemberRemovedEvent.EVENT_TYPE }),
            );
            expect(warn).toHaveBeenCalledWith(expect.stringContaining('connection lost'));
        });

        it('still completes and publishes the removed event when the user group policy update fails', async () => {
            const warn = jest.spyOn(console, 'warn').mockImplementation();
            deleteUserGroupPolicy.mockRejectedValueOnce(new Error('lock wait timeout'));

            await expect(handler.execute(command)).resolves.toBeUndefined();

            expect(publish).toHaveBeenCalledTimes(1);
            expect(publish).toHaveBeenCalledWith(
                expect.objectContaining({ eventType: GroupPolicyMemberRemovedEvent.EVENT_TYPE }),
            );
            expect(warn).toHaveBeenCalledWith(expect.stringContaining('lock wait timeout'));
        });

        it('does not touch the user group policy mirror when the member mirror row cannot be deleted', async () => {
            deleteMember.mockRejectedValueOnce(new Error('deadlock'));

            await expect(handler.execute(command)).rejects.toThrow('deadlock');

            expect(deleteUserGroupPolicy).not.toHaveBeenCalled();
        });

        it('does not read or touch the mirror when BeyondTrust rejects the removal', async () => {
            jest.spyOn(commandBus, 'execute').mockRejectedValueOnce(new Error('404'));

            await expect(handler.execute(command)).rejects.toThrow('404');

            expect(findMember).not.toHaveBeenCalled();
            expect(deleteUserGroupPolicy).not.toHaveBeenCalled();
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
    commandBus.execute = jest.fn().mockReturnValue(Promise.resolve());

    return commandBus;
}

function mockGroupPolicyMemberRepositoryService() {
    const groupPolicyMemberRepositoryService = {} as GroupPolicyMemberRepositoryService;
    groupPolicyMemberRepositoryService.deleteByGroupPolicyIdAndMemberId = jest.fn();
    groupPolicyMemberRepositoryService.findOneByGroupPolicyIdAndMemberId = jest.fn().mockResolvedValue({
        userId: 5,
    } as GroupPolicyMemberEntity);

    return groupPolicyMemberRepositoryService;
}
