import { CommandBus, EventBus } from '@nestjs/cqrs';
import { DeleteJumpClientCommand as BTDeleteJumpClientCommand } from '../../../beyondtrust-pra-conf-api/jump-client/commands';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpClientDeletedEvent, JumpClientDeletionFailedEvent } from '../../events';
import { JumpClientRepositoryService } from '../../repositories/services/jump-client-repository.service';
import { DeleteJumpClientCommand } from '../delete-jump-client.command';
import { DeleteJumpClientCommandHandler } from './delete-jump-client.command-handler';

describe('DeleteJumpClientCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let jumpClientRepositoryService: JumpClientRepositoryService;
    let handler: DeleteJumpClientCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        jumpClientRepositoryService = mockJumpClientRepositoryService();
        handler = new DeleteJumpClientCommandHandler(commandBus, eventBus, jumpClientRepositoryService);
    });

    it('should call the command bus with correct parameters, delete data from db and publish an event', async () => {
        const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
        const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
        const jumpClientRepositoryServiceDeleteByIdMethod = jest.spyOn(jumpClientRepositoryService, 'deleteById');

        await handler.execute(new DeleteJumpClientCommand('transaction-1', 100, 123));

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(new BTDeleteJumpClientCommand('transaction-1', 100, 123));
        expect(jumpClientRepositoryServiceDeleteByIdMethod).toHaveBeenCalledWith(100, 123);
        expect(eventBusPublishMethod).toHaveBeenCalledWith(
            expect.objectContaining(<JumpClientDeletedEvent>{
                transactionId: 'transaction-1',
                eventType: JumpClientDeletedEvent.EVENT_TYPE,
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
        const jumpClientRepositoryServiceDeleteByIdMethod = jest.spyOn(jumpClientRepositoryService, 'deleteById');

        await expect(handler.execute(new DeleteJumpClientCommand('transaction-1', 100, 123))).rejects.toThrow(
            expectedError,
        );

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(new BTDeleteJumpClientCommand('transaction-1', 100, 123));
        expect(jumpClientRepositoryServiceDeleteByIdMethod).not.toHaveBeenCalled();
        expect(eventBusPublishMethod).not.toHaveBeenCalled();
    });

    it('should publish an error event and throw an error if the repository fails', async () => {
        const expectedError = new Error('Repository error');
        const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
        const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
        const jumpClientRepositoryServiceDeleteByIdMethod = jest
            .spyOn(jumpClientRepositoryService, 'deleteById')
            .mockRejectedValue(expectedError);
        const errorProcessorUtilityStringifyMethod = jest
            .spyOn(ErrorProcessorUtility, 'stringify')
            .mockReturnValue('expected-error-message');

        await expect(handler.execute(new DeleteJumpClientCommand('transaction-1', 100, 123))).rejects.toThrow(
            expectedError,
        );

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(new BTDeleteJumpClientCommand('transaction-1', 100, 123));
        expect(jumpClientRepositoryServiceDeleteByIdMethod).toHaveBeenCalledWith(100, 123);
        expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
        expect(eventBusPublishMethod).toHaveBeenCalledWith(
            expect.objectContaining({
                transactionId: 'transaction-1',
                eventType: JumpClientDeletionFailedEvent.EVENT_TYPE,
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

function mockJumpClientRepositoryService(): JumpClientRepositoryService {
    const service = {} as JumpClientRepositoryService;
    service.deleteById = jest.fn().mockReturnValue(Promise.resolve());

    return service;
}
