import { CommandBus, EventBus } from '@nestjs/cqrs';
import { DeleteRemoteRdpCommand as BTDeleteRemoteRdpCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/remote-rdp/commands';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { RemoteRdpDeletedEvent, RemoteRdpDeletionFailedEvent } from '../../events';
import { RemoteRdpRepositoryService } from '../../repositories/services/remote-rdp-repository.service';
import { DeleteRemoteRdpCommand } from '../delete-remote-rdp.command';
import { DeleteRemoteRdpCommandHandler } from './delete-remote-rdp.command-handler';

describe('DeleteRemoteRdpCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let remoteRdpRepositoryService: RemoteRdpRepositoryService;
    let handler: DeleteRemoteRdpCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        remoteRdpRepositoryService = mockRemoteRdpRepositoryService();
        handler = new DeleteRemoteRdpCommandHandler(commandBus, eventBus, remoteRdpRepositoryService);
    });

    it('should call the command bus with correct parameters, delete data from db and publish an event', async () => {
        const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
        const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
        const remoteRdpRepositoryServiceDeleteByIdMethod = jest.spyOn(remoteRdpRepositoryService, 'deleteById');

        await handler.execute(new DeleteRemoteRdpCommand('transaction-1', 123));

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(new BTDeleteRemoteRdpCommand('transaction-1', 123));
        expect(remoteRdpRepositoryServiceDeleteByIdMethod).toHaveBeenCalledWith(123);
        expect(eventBusPublishMethod).toHaveBeenCalledWith(
            expect.objectContaining(<RemoteRdpDeletedEvent>{
                transactionId: 'transaction-1',
                eventType: RemoteRdpDeletedEvent.EVENT_TYPE,
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
        const remoteRdpRepositoryServiceDeleteByIdMethod = jest.spyOn(remoteRdpRepositoryService, 'deleteById');

        await expect(handler.execute(new DeleteRemoteRdpCommand('transaction-1', 123))).rejects.toThrow(expectedError);

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(new BTDeleteRemoteRdpCommand('transaction-1', 123));
        expect(remoteRdpRepositoryServiceDeleteByIdMethod).not.toHaveBeenCalled();
        expect(eventBusPublishMethod).not.toHaveBeenCalled();
    });

    it('should publish an error event and throw an error if the repository fails', async () => {
        const expectedError = new Error('Repository error');
        const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
        const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
        const remoteRdpRepositoryServiceDeleteByIdMethod = jest
            .spyOn(remoteRdpRepositoryService, 'deleteById')
            .mockRejectedValue(expectedError);
        const errorProcessorUtilityStringifyMethod = jest
            .spyOn(ErrorProcessorUtility, 'stringify')
            .mockReturnValue('expected-error-message');

        await expect(handler.execute(new DeleteRemoteRdpCommand('transaction-1', 123))).rejects.toThrow(expectedError);

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(new BTDeleteRemoteRdpCommand('transaction-1', 123));
        expect(remoteRdpRepositoryServiceDeleteByIdMethod).toHaveBeenCalledWith(123);
        expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
        expect(eventBusPublishMethod).toHaveBeenCalledWith(
            expect.objectContaining({
                transactionId: 'transaction-1',
                eventType: RemoteRdpDeletionFailedEvent.EVENT_TYPE,
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

function mockRemoteRdpRepositoryService(): RemoteRdpRepositoryService {
    const service = {} as RemoteRdpRepositoryService;
    service.deleteById = jest.fn().mockReturnValue(Promise.resolve());

    return service;
}
