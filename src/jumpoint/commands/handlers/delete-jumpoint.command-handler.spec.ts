import { CommandBus, EventBus } from '@nestjs/cqrs';
import { DeleteJumpointCommand as BTDeleteJumpointCommand } from '../../../beyondtrust-pra-conf-api/jumpoint/commands';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpointDeletedEvent, JumpointDeletionFailedEvent } from '../../events';
import { JumpointRepositoryService } from '../../repositories/services/jumpoint-repository.service';
import { DeleteJumpointCommand } from '../delete-jumpoint.command';
import { DeleteJumpointCommandHandler } from './delete-jumpoint.command-handler';

describe('DeleteJumpointCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let jumpointRepositoryService: JumpointRepositoryService;
    let handler: DeleteJumpointCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        jumpointRepositoryService = mockJumpointRepositoryService();
        handler = new DeleteJumpointCommandHandler(commandBus, eventBus, jumpointRepositoryService);
    });

    it('should call the command bus with correct parameters, delete data from db and publish an event', async () => {
        const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
        const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
        const jumpointRepositoryServiceDeleteByIdMethod = jest.spyOn(jumpointRepositoryService, 'deleteById');

        await handler.execute(new DeleteJumpointCommand('transaction-1', 123));

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(new BTDeleteJumpointCommand('transaction-1', 123));
        expect(jumpointRepositoryServiceDeleteByIdMethod).toHaveBeenCalledWith(123);
        expect(eventBusPublishMethod).toHaveBeenCalledWith(
            expect.objectContaining(<JumpointDeletedEvent>{
                transactionId: 'transaction-1',
                eventType: JumpointDeletedEvent.EVENT_TYPE,
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
        const jumpointRepositoryServiceDeleteByIdMethod = jest.spyOn(jumpointRepositoryService, 'deleteById');

        await expect(handler.execute(new DeleteJumpointCommand('transaction-1', 123))).rejects.toThrow(expectedError);

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(new BTDeleteJumpointCommand('transaction-1', 123));
        expect(jumpointRepositoryServiceDeleteByIdMethod).not.toHaveBeenCalled();
        expect(eventBusPublishMethod).not.toHaveBeenCalled();
    });

    it('should publish an error event and throw an error if the repository fails', async () => {
        const expectedError = new Error('Repository error');
        const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
        const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
        const jumpointRepositoryServiceDeleteByIdMethod = jest
            .spyOn(jumpointRepositoryService, 'deleteById')
            .mockRejectedValue(expectedError);
        const errorProcessorUtilityStringifyMethod = jest
            .spyOn(ErrorProcessorUtility, 'stringify')
            .mockReturnValue('expected-error-message');

        await expect(handler.execute(new DeleteJumpointCommand('transaction-1', 123))).rejects.toThrow(expectedError);

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(new BTDeleteJumpointCommand('transaction-1', 123));
        expect(jumpointRepositoryServiceDeleteByIdMethod).toHaveBeenCalledWith(123);
        expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
        expect(eventBusPublishMethod).toHaveBeenCalledWith(
            expect.objectContaining({
                transactionId: 'transaction-1',
                eventType: JumpointDeletionFailedEvent.EVENT_TYPE,
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

function mockJumpointRepositoryService(): JumpointRepositoryService {
    const service = {} as JumpointRepositoryService;
    service.deleteById = jest.fn().mockReturnValue(Promise.resolve());

    return service;
}
