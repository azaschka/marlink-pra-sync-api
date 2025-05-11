import { CommandBus, EventBus } from '@nestjs/cqrs';
import { DeleteGroupPolicyCommand as BTDeleteGroupPolicyCommand } from '../../../beyondtrust-pra-conf-api/group-policy/commands';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { GroupPolicyDeletedEvent, GroupPolicyDeletionFailedEvent } from '../../events';
import { GroupPolicyRepositoryService } from '../../repositories/services/group-policy-repository.service';
import { DeleteGroupPolicyCommand } from '../delete-group-policy.command';
import { DeleteGroupPolicyCommandHandler } from './delete-group-policy.command-handler';

describe('DeleteGroupPolicyCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let groupPolicyRepositoryService: GroupPolicyRepositoryService;
    let handler: DeleteGroupPolicyCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        groupPolicyRepositoryService = mockGroupPolicyRepositoryService();
        handler = new DeleteGroupPolicyCommandHandler(commandBus, eventBus, groupPolicyRepositoryService);
    });

    it('should call the command bus with correct parameters, delete data from db and publish an event', async () => {
        const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
        const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
        const groupPolicyRepositoryServiceDeleteByIdMethod = jest.spyOn(groupPolicyRepositoryService, 'deleteById');

        await handler.execute(new DeleteGroupPolicyCommand('transaction-1', 123));

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(new BTDeleteGroupPolicyCommand('transaction-1', 123));
        expect(groupPolicyRepositoryServiceDeleteByIdMethod).toHaveBeenCalledWith(123);
        expect(eventBusPublishMethod).toHaveBeenCalledWith(
            expect.objectContaining(<GroupPolicyDeletedEvent>{
                transactionId: 'transaction-1',
                eventType: GroupPolicyDeletedEvent.EVENT_TYPE,
                payload: {
                    id: 123,
                },
            }),
        );
    });

    it('should throw an error if the command bus fails', async () => {
        const expectedError = new Error('Command bus error');
        const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute').mockRejectedValue(expectedError);
        const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
        const groupPolicyRepositoryServiceDeleteByIdMethod = jest.spyOn(groupPolicyRepositoryService, 'deleteById');

        await expect(handler.execute(new DeleteGroupPolicyCommand('transaction-1', 123))).rejects.toThrow(
            expectedError,
        );

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(new BTDeleteGroupPolicyCommand('transaction-1', 123));
        expect(groupPolicyRepositoryServiceDeleteByIdMethod).not.toHaveBeenCalled();
        expect(eventBusPublishMethod).not.toHaveBeenCalled();
    });

    it('should publish an error event and throw an error if the repository fails', async () => {
        const expectedError = new Error('Repository error');
        const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
        const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
        const groupPolicyRepositoryServiceDeleteByIdMethod = jest
            .spyOn(groupPolicyRepositoryService, 'deleteById')
            .mockRejectedValue(expectedError);
        const errorProcessorUtilityStringifyMethod = jest
            .spyOn(ErrorProcessorUtility, 'stringify')
            .mockReturnValue('expected-error-message');

        await expect(handler.execute(new DeleteGroupPolicyCommand('transaction-1', 123))).rejects.toThrow(
            expectedError,
        );

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(new BTDeleteGroupPolicyCommand('transaction-1', 123));
        expect(groupPolicyRepositoryServiceDeleteByIdMethod).toHaveBeenCalledWith(123);
        expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
        expect(eventBusPublishMethod).toHaveBeenCalledWith(
            expect.objectContaining({
                transactionId: 'transaction-1',
                eventType: GroupPolicyDeletionFailedEvent.EVENT_TYPE,
                payload: {
                    errorMessage: 'expected-error-message',
                    id: 123,
                },
            }),
        );
    });
});

function mockCommandBus() {
    const service = {} as CommandBus;
    service.execute = jest.fn().mockResolvedValue(Promise.resolve());

    return service;
}

function mockEventBus() {
    const service = {} as EventBus;
    service.publish = jest.fn().mockResolvedValue(Promise.resolve());

    return service;
}

function mockGroupPolicyRepositoryService(): GroupPolicyRepositoryService {
    const service = {} as GroupPolicyRepositoryService;
    service.deleteById = jest.fn().mockReturnValue(Promise.resolve());

    return service;
}
