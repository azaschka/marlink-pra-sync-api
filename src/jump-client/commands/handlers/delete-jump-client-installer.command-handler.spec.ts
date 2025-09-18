import { CommandBus, EventBus } from '@nestjs/cqrs';
import { DeleteJumpClientInstallerCommand as BTDeleteJumpClientInstallerCommand } from '../../../beyondtrust-pra-conf-api/jump-client/commands';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpClientInstallerDeletedEvent, JumpClientInstallerDeletionFailedEvent } from '../../events';
import { JumpClientInstallerRepositoryService } from '../../repositories/services/jump-client-installer-repository.service';
import { DeleteJumpClientInstallerCommand } from '../delete-jump-client-installer.command';
import { DeleteJumpClientInstallerCommandHandler } from './delete-jump-client-installer.command-handler';

describe('DeleteJumpClientInstallerCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let jumpClientInstallerRepositoryService: JumpClientInstallerRepositoryService;
    let handler: DeleteJumpClientInstallerCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        jumpClientInstallerRepositoryService = mockJumpClientInstallerRepositoryService();
        handler = new DeleteJumpClientInstallerCommandHandler(
            commandBus,
            eventBus,
            jumpClientInstallerRepositoryService,
        );
    });

    it('should call the command bus with correct parameters, delete data from db and publish an event', async () => {
        const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
        const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
        const jumpClientInstallerRepositoryServiceDeleteByIdMethod = jest.spyOn(
            jumpClientInstallerRepositoryService,
            'deleteById',
        );

        await handler.execute(new DeleteJumpClientInstallerCommand('transaction-1', 100, 123));

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(
            new BTDeleteJumpClientInstallerCommand('transaction-1', 123),
        );
        expect(jumpClientInstallerRepositoryServiceDeleteByIdMethod).toHaveBeenCalledWith(100, 123);
        expect(eventBusPublishMethod).toHaveBeenCalledWith(
            expect.objectContaining(<JumpClientInstallerDeletedEvent>{
                transactionId: 'transaction-1',
                eventType: JumpClientInstallerDeletedEvent.EVENT_TYPE,
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
        const jumpClientInstallerRepositoryServiceDeleteByIdMethod = jest.spyOn(
            jumpClientInstallerRepositoryService,
            'deleteById',
        );

        await expect(handler.execute(new DeleteJumpClientInstallerCommand('transaction-1', 100, 123))).rejects.toThrow(
            expectedError,
        );

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(
            new BTDeleteJumpClientInstallerCommand('transaction-1', 123),
        );
        expect(jumpClientInstallerRepositoryServiceDeleteByIdMethod).not.toHaveBeenCalled();
        expect(eventBusPublishMethod).not.toHaveBeenCalled();
    });

    it('should publish an error event and throw an error if the repository fails', async () => {
        const expectedError = new Error('Repository error');
        const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
        const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
        const jumpClientInstallerRepositoryServiceDeleteByIdMethod = jest
            .spyOn(jumpClientInstallerRepositoryService, 'deleteById')
            .mockRejectedValue(expectedError);
        const errorProcessorUtilityStringifyMethod = jest
            .spyOn(ErrorProcessorUtility, 'stringify')
            .mockReturnValue('expected-error-message');

        await expect(handler.execute(new DeleteJumpClientInstallerCommand('transaction-1', 100, 123))).rejects.toThrow(
            expectedError,
        );

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(
            new BTDeleteJumpClientInstallerCommand('transaction-1', 123),
        );
        expect(jumpClientInstallerRepositoryServiceDeleteByIdMethod).toHaveBeenCalledWith(100, 123);
        expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
        expect(eventBusPublishMethod).toHaveBeenCalledWith(
            expect.objectContaining({
                transactionId: 'transaction-1',
                eventType: JumpClientInstallerDeletionFailedEvent.EVENT_TYPE,
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

function mockJumpClientInstallerRepositoryService(): JumpClientInstallerRepositoryService {
    const service = {} as JumpClientInstallerRepositoryService;
    service.deleteById = jest.fn().mockReturnValue(Promise.resolve());

    return service;
}
