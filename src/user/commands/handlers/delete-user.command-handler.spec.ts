import { CommandBus, EventBus } from '@nestjs/cqrs';
import { DeleteUserCommand as BTDeleteUserCommand } from '../../../beyondtrust-pra-conf-api/user/commands';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { UserDeletedEvent, UserDeletionFailedEvent } from '../../events';
import { UserRepositoryService } from '../../repositories/services/user-repository.service';
import { DeleteUserCommand } from '../delete-user.command';
import { DeleteUserCommandHandler } from './delete-user.command-handler';

describe('DeleteUserCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let userRepositoryService: UserRepositoryService;
    let handler: DeleteUserCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        userRepositoryService = mockUserRepositoryService();
        handler = new DeleteUserCommandHandler(commandBus, eventBus, userRepositoryService);
    });

    it('should call the command bus with correct parameters, delete data from db and publish an event', async () => {
        const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
        const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
        const userRepositoryServiceDeleteByIdMethod = jest.spyOn(userRepositoryService, 'deleteById');

        await handler.execute(new DeleteUserCommand('transaction-1', 100, 123));

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(new BTDeleteUserCommand('transaction-1', 123));
        expect(userRepositoryServiceDeleteByIdMethod).toHaveBeenCalledWith(100, 123);
        expect(eventBusPublishMethod).toHaveBeenCalledWith(
            expect.objectContaining(<UserDeletedEvent>{
                transactionId: 'transaction-1',
                eventType: UserDeletedEvent.EVENT_TYPE,
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
        const userRepositoryServiceDeleteByIdMethod = jest.spyOn(userRepositoryService, 'deleteById');

        await expect(handler.execute(new DeleteUserCommand('transaction-1', 100, 123))).rejects.toThrow(expectedError);

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(new BTDeleteUserCommand('transaction-1', 123));
        expect(userRepositoryServiceDeleteByIdMethod).not.toHaveBeenCalled();
        expect(eventBusPublishMethod).not.toHaveBeenCalled();
    });

    it('should publish an error event and throw an error if the repository fails', async () => {
        const expectedError = new Error('Repository error');
        const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
        const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
        const userRepositoryServiceDeleteByIdMethod = jest
            .spyOn(userRepositoryService, 'deleteById')
            .mockRejectedValue(expectedError);
        const errorProcessorUtilityStringifyMethod = jest
            .spyOn(ErrorProcessorUtility, 'stringify')
            .mockReturnValue('expected-error-message');

        await expect(handler.execute(new DeleteUserCommand('transaction-1', 100, 123))).rejects.toThrow(expectedError);

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(new BTDeleteUserCommand('transaction-1', 123));
        expect(userRepositoryServiceDeleteByIdMethod).toHaveBeenCalledWith(100, 123);
        expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
        expect(eventBusPublishMethod).toHaveBeenCalledWith(
            expect.objectContaining({
                transactionId: 'transaction-1',
                eventType: UserDeletionFailedEvent.EVENT_TYPE,
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

function mockUserRepositoryService(): UserRepositoryService {
    const service = {} as UserRepositoryService;
    service.deleteById = jest.fn().mockReturnValue(Promise.resolve());

    return service;
}
