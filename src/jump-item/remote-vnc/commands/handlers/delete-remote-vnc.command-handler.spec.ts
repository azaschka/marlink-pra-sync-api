import { CommandBus, EventBus } from '@nestjs/cqrs';
import { DeleteRemoteVncCommand as BTDeleteRemoteVncCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/remote-vnc/commands';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { RemoteVncDeletedEvent, RemoteVncDeletionFailedEvent } from '../../events';
import { RemoteVncRepositoryService } from '../../repositories/services/remote-vnc-repository.service';
import { DeleteRemoteVncCommand } from '../delete-remote-vnc.command';
import { DeleteRemoteVncCommandHandler } from './delete-remote-vnc.command-handler';

describe('DeleteRemoteVncCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let remoteVncRepositoryService: RemoteVncRepositoryService;
    let handler: DeleteRemoteVncCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        remoteVncRepositoryService = mockRemoteVncRepositoryService();
        handler = new DeleteRemoteVncCommandHandler(commandBus, eventBus, remoteVncRepositoryService);
    });

    it('should call the command bus with correct parameters, delete data from db and publish an event', async () => {
        const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
        const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
        const remoteVncRepositoryServiceDeleteByIdMethod = jest.spyOn(remoteVncRepositoryService, 'deleteById');

        await handler.execute(new DeleteRemoteVncCommand('transaction-1', 100, 123));

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(new BTDeleteRemoteVncCommand('transaction-1', 100, 123));
        expect(remoteVncRepositoryServiceDeleteByIdMethod).toHaveBeenCalledWith(100, 123);
        expect(eventBusPublishMethod).toHaveBeenCalledWith(
            expect.objectContaining(<RemoteVncDeletedEvent>{
                transactionId: 'transaction-1',
                eventType: RemoteVncDeletedEvent.EVENT_TYPE,
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
        const remoteVncRepositoryServiceDeleteByIdMethod = jest.spyOn(remoteVncRepositoryService, 'deleteById');

        await expect(handler.execute(new DeleteRemoteVncCommand('transaction-1', 100, 123))).rejects.toThrow(
            expectedError,
        );

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(new BTDeleteRemoteVncCommand('transaction-1', 100, 123));
        expect(remoteVncRepositoryServiceDeleteByIdMethod).not.toHaveBeenCalled();
        expect(eventBusPublishMethod).not.toHaveBeenCalled();
    });

    it('should publish an error event and throw an error if the repository fails', async () => {
        const expectedError = new Error('Repository error');
        const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
        const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
        const remoteVncRepositoryServiceDeleteByIdMethod = jest
            .spyOn(remoteVncRepositoryService, 'deleteById')
            .mockRejectedValue(expectedError);
        const errorProcessorUtilityStringifyMethod = jest
            .spyOn(ErrorProcessorUtility, 'stringify')
            .mockReturnValue('expected-error-message');

        await expect(handler.execute(new DeleteRemoteVncCommand('transaction-1', 100, 123))).rejects.toThrow(
            expectedError,
        );

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(new BTDeleteRemoteVncCommand('transaction-1', 100, 123));
        expect(remoteVncRepositoryServiceDeleteByIdMethod).toHaveBeenCalledWith(100, 123);
        expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
        expect(eventBusPublishMethod).toHaveBeenCalledWith(
            expect.objectContaining({
                transactionId: 'transaction-1',
                eventType: RemoteVncDeletionFailedEvent.EVENT_TYPE,
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

function mockRemoteVncRepositoryService(): RemoteVncRepositoryService {
    const service = {} as RemoteVncRepositoryService;
    service.deleteById = jest.fn().mockReturnValue(Promise.resolve());

    return service;
}
