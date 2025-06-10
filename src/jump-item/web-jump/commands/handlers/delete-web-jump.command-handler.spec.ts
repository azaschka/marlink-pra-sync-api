import { CommandBus, EventBus } from '@nestjs/cqrs';
import { DeleteWebJumpCommand as BTDeleteWebJumpCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/web-jump/commands';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { WebJumpDeletedEvent, WebJumpDeletionFailedEvent } from '../../events';
import { WebJumpRepositoryService } from '../../repositories/services/web-jump-repository.service';
import { DeleteWebJumpCommand } from '../delete-web-jump.command';
import { DeleteWebJumpCommandHandler } from './delete-web-jump.command-handler';

describe('DeleteWebJumpCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let webJumpRepositoryService: WebJumpRepositoryService;
    let handler: DeleteWebJumpCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        webJumpRepositoryService = mockWebJumpRepositoryService();
        handler = new DeleteWebJumpCommandHandler(commandBus, eventBus, webJumpRepositoryService);
    });

    it('should call the command bus with correct parameters, delete data from db and publish an event', async () => {
        const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
        const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
        const webJumpRepositoryServiceDeleteByIdMethod = jest.spyOn(webJumpRepositoryService, 'deleteById');

        await handler.execute(new DeleteWebJumpCommand('transaction-1', 123));

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(new BTDeleteWebJumpCommand('transaction-1', 123));
        expect(webJumpRepositoryServiceDeleteByIdMethod).toHaveBeenCalledWith(123);
        expect(eventBusPublishMethod).toHaveBeenCalledWith(
            expect.objectContaining(<WebJumpDeletedEvent>{
                transactionId: 'transaction-1',
                eventType: WebJumpDeletedEvent.EVENT_TYPE,
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
        const webJumpRepositoryServiceDeleteByIdMethod = jest.spyOn(webJumpRepositoryService, 'deleteById');

        await expect(handler.execute(new DeleteWebJumpCommand('transaction-1', 123))).rejects.toThrow(expectedError);

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(new BTDeleteWebJumpCommand('transaction-1', 123));
        expect(webJumpRepositoryServiceDeleteByIdMethod).not.toHaveBeenCalled();
        expect(eventBusPublishMethod).not.toHaveBeenCalled();
    });

    it('should publish an error event and throw an error if the repository fails', async () => {
        const expectedError = new Error('Repository error');
        const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
        const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
        const webJumpRepositoryServiceDeleteByIdMethod = jest
            .spyOn(webJumpRepositoryService, 'deleteById')
            .mockRejectedValue(expectedError);
        const errorProcessorUtilityStringifyMethod = jest
            .spyOn(ErrorProcessorUtility, 'stringify')
            .mockReturnValue('expected-error-message');

        await expect(handler.execute(new DeleteWebJumpCommand('transaction-1', 123))).rejects.toThrow(expectedError);

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(new BTDeleteWebJumpCommand('transaction-1', 123));
        expect(webJumpRepositoryServiceDeleteByIdMethod).toHaveBeenCalledWith(123);
        expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
        expect(eventBusPublishMethod).toHaveBeenCalledWith(
            expect.objectContaining({
                transactionId: 'transaction-1',
                eventType: WebJumpDeletionFailedEvent.EVENT_TYPE,
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

function mockWebJumpRepositoryService(): WebJumpRepositoryService {
    const service = {} as WebJumpRepositoryService;
    service.deleteById = jest.fn().mockReturnValue(Promise.resolve());

    return service;
}
