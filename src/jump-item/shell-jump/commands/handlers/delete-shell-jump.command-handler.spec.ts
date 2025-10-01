import { CommandBus, EventBus } from '@nestjs/cqrs';
import { DeleteShellJumpCommand as BTDeleteShellJumpCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/shell-jump/commands';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { ShellJumpDeletedEvent, ShellJumpDeletionFailedEvent } from '../../events';
import { ShellJumpRepositoryService } from '../../repositories/services/shell-jump-repository.service';
import { DeleteShellJumpCommand } from '../delete-shell-jump.command';
import { DeleteShellJumpCommandHandler } from './delete-shell-jump.command-handler';

describe('DeleteShellJumpCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let shellJumpRepositoryService: ShellJumpRepositoryService;
    let handler: DeleteShellJumpCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        shellJumpRepositoryService = mockShellJumpRepositoryService();
        handler = new DeleteShellJumpCommandHandler(commandBus, eventBus, shellJumpRepositoryService);
    });

    it('should call the command bus with correct parameters, delete data from db and publish an event', async () => {
        const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
        const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
        const shellJumpRepositoryServiceDeleteByIdMethod = jest.spyOn(shellJumpRepositoryService, 'deleteById');

        await handler.execute(new DeleteShellJumpCommand('transaction-1', 100, 123));

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(new BTDeleteShellJumpCommand('transaction-1', 100, 123));
        expect(shellJumpRepositoryServiceDeleteByIdMethod).toHaveBeenCalledWith(100, 123);
        expect(eventBusPublishMethod).toHaveBeenCalledWith(
            expect.objectContaining(<ShellJumpDeletedEvent>{
                transactionId: 'transaction-1',
                eventType: ShellJumpDeletedEvent.EVENT_TYPE,
                payload: {
                    id: 123,
                    tenantId: 100,
                },
            }),
        );
    });

    it('should throw an error if the command bus fails', async () => {
        const expectedError = new Error('Command bus error');
        const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute').mockRejectedValue(expectedError);
        const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
        const shellJumpRepositoryServiceDeleteByIdMethod = jest.spyOn(shellJumpRepositoryService, 'deleteById');

        await expect(handler.execute(new DeleteShellJumpCommand('transaction-1', 100, 123))).rejects.toThrow(
            expectedError,
        );

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(new BTDeleteShellJumpCommand('transaction-1', 100, 123));
        expect(shellJumpRepositoryServiceDeleteByIdMethod).not.toHaveBeenCalled();
        expect(eventBusPublishMethod).not.toHaveBeenCalled();
    });

    it('should publish an error event and throw an error if the repository fails', async () => {
        const expectedError = new Error('Repository error');
        const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
        const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
        const shellJumpRepositoryServiceDeleteByIdMethod = jest
            .spyOn(shellJumpRepositoryService, 'deleteById')
            .mockRejectedValue(expectedError);
        const errorProcessorUtilityStringifyMethod = jest
            .spyOn(ErrorProcessorUtility, 'stringify')
            .mockReturnValue('expected-error-message');

        await expect(handler.execute(new DeleteShellJumpCommand('transaction-1', 100, 123))).rejects.toThrow(
            expectedError,
        );

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(new BTDeleteShellJumpCommand('transaction-1', 100, 123));
        expect(shellJumpRepositoryServiceDeleteByIdMethod).toHaveBeenCalledWith(100, 123);
        expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
        expect(eventBusPublishMethod).toHaveBeenCalledWith(
            expect.objectContaining({
                transactionId: 'transaction-1',
                eventType: ShellJumpDeletionFailedEvent.EVENT_TYPE,
                payload: {
                    errorMessage: 'expected-error-message',
                    id: 123,
                    tenantId: 100,
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

function mockShellJumpRepositoryService(): ShellJumpRepositoryService {
    const service = {} as ShellJumpRepositoryService;
    service.deleteById = jest.fn().mockReturnValue(Promise.resolve());

    return service;
}
