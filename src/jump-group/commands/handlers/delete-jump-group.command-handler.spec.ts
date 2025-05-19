import { CommandBus, EventBus } from '@nestjs/cqrs';
import { DeleteJumpGroupCommand as BTDeleteJumpGroupCommand } from '../../../beyondtrust-pra-conf-api/jump-group/commands';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpGroupDeletedEvent, JumpGroupDeletionFailedEvent } from '../../events';
import { JumpGroupRepositoryService } from '../../repositories/services/jump-group-repository.service';
import { DeleteJumpGroupCommand } from '../delete-jump-group.command';
import { DeleteJumpGroupCommandHandler } from './delete-jump-group.command-handler';

describe('DeleteJumpGroupCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let jumpGroupRepositoryService: JumpGroupRepositoryService;
    let handler: DeleteJumpGroupCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        jumpGroupRepositoryService = mockJumpGroupRepositoryService();
        handler = new DeleteJumpGroupCommandHandler(commandBus, eventBus, jumpGroupRepositoryService);
    });

    it('should call the command bus with correct parameters, delete data from db and publish an event', async () => {
        const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
        const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
        const jumpGroupRepositoryServiceDeleteByIdMethod = jest.spyOn(jumpGroupRepositoryService, 'deleteById');

        await handler.execute(new DeleteJumpGroupCommand('transaction-1', 123));

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(new BTDeleteJumpGroupCommand('transaction-1', 123));
        expect(jumpGroupRepositoryServiceDeleteByIdMethod).toHaveBeenCalledWith(123);
        expect(eventBusPublishMethod).toHaveBeenCalledWith(
            expect.objectContaining(<JumpGroupDeletedEvent>{
                transactionId: 'transaction-1',
                eventType: JumpGroupDeletedEvent.EVENT_TYPE,
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
        const jumpGroupRepositoryServiceDeleteByIdMethod = jest.spyOn(jumpGroupRepositoryService, 'deleteById');

        await expect(handler.execute(new DeleteJumpGroupCommand('transaction-1', 123))).rejects.toThrow(expectedError);

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(new BTDeleteJumpGroupCommand('transaction-1', 123));
        expect(jumpGroupRepositoryServiceDeleteByIdMethod).not.toHaveBeenCalled();
        expect(eventBusPublishMethod).not.toHaveBeenCalled();
    });

    it('should publish an error event and throw an error if the repository fails', async () => {
        const expectedError = new Error('Repository error');
        const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
        const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
        const jumpGroupRepositoryServiceDeleteByIdMethod = jest
            .spyOn(jumpGroupRepositoryService, 'deleteById')
            .mockRejectedValue(expectedError);
        const errorProcessorUtilityStringifyMethod = jest
            .spyOn(ErrorProcessorUtility, 'stringify')
            .mockReturnValue('expected-error-message');

        await expect(handler.execute(new DeleteJumpGroupCommand('transaction-1', 123))).rejects.toThrow(expectedError);

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(new BTDeleteJumpGroupCommand('transaction-1', 123));
        expect(jumpGroupRepositoryServiceDeleteByIdMethod).toHaveBeenCalledWith(123);
        expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
        expect(eventBusPublishMethod).toHaveBeenCalledWith(
            expect.objectContaining({
                transactionId: 'transaction-1',
                eventType: JumpGroupDeletionFailedEvent.EVENT_TYPE,
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

function mockJumpGroupRepositoryService(): JumpGroupRepositoryService {
    const service = {} as JumpGroupRepositoryService;
    service.deleteById = jest.fn().mockReturnValue(Promise.resolve());

    return service;
}
