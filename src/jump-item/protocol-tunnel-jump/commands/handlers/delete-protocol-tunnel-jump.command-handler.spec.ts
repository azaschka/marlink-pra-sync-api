import { CommandBus, EventBus } from '@nestjs/cqrs';
import { DeleteProtocolTunnelJumpCommand as BTDeleteProtocolTunnelJumpCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/protocol-tunnel-jump/commands';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { ProtocolTunnelJumpDeletedEvent, ProtocolTunnelJumpDeletionFailedEvent } from '../../events';
import { ProtocolTunnelJumpRepositoryService } from '../../repositories/services/protocol-tunnel-jump-repository.service';
import { DeleteProtocolTunnelJumpCommand } from '../delete-protocol-tunnel-jump.command';
import { DeleteProtocolTunnelJumpCommandHandler } from './delete-protocol-tunnel-jump.command-handler';

describe('DeleteProtocolTunnelJumpCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let protocolTunnelJumpRepositoryService: ProtocolTunnelJumpRepositoryService;
    let handler: DeleteProtocolTunnelJumpCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        protocolTunnelJumpRepositoryService = mockProtocolTunnelJumpRepositoryService();
        handler = new DeleteProtocolTunnelJumpCommandHandler(commandBus, eventBus, protocolTunnelJumpRepositoryService);
    });

    it('should call the command bus with correct parameters, delete data from db and publish an event', async () => {
        const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
        const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
        const protocolTunnelJumpRepositoryServiceDeleteByIdMethod = jest.spyOn(
            protocolTunnelJumpRepositoryService,
            'deleteById',
        );

        await handler.execute(new DeleteProtocolTunnelJumpCommand('transaction-1', 100, 123));

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(
            new BTDeleteProtocolTunnelJumpCommand('transaction-1', 123),
        );
        expect(protocolTunnelJumpRepositoryServiceDeleteByIdMethod).toHaveBeenCalledWith(100, 123);
        expect(eventBusPublishMethod).toHaveBeenCalledWith(
            expect.objectContaining(<ProtocolTunnelJumpDeletedEvent>{
                transactionId: 'transaction-1',
                eventType: ProtocolTunnelJumpDeletedEvent.EVENT_TYPE,
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
        const protocolTunnelJumpRepositoryServiceDeleteByIdMethod = jest.spyOn(
            protocolTunnelJumpRepositoryService,
            'deleteById',
        );

        await expect(handler.execute(new DeleteProtocolTunnelJumpCommand('transaction-1', 100, 123))).rejects.toThrow(
            expectedError,
        );

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(
            new BTDeleteProtocolTunnelJumpCommand('transaction-1', 123),
        );
        expect(protocolTunnelJumpRepositoryServiceDeleteByIdMethod).not.toHaveBeenCalled();
        expect(eventBusPublishMethod).not.toHaveBeenCalled();
    });

    it('should publish an error event and throw an error if the repository fails', async () => {
        const expectedError = new Error('Repository error');
        const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
        const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
        const protocolTunnelJumpRepositoryServiceDeleteByIdMethod = jest
            .spyOn(protocolTunnelJumpRepositoryService, 'deleteById')
            .mockRejectedValue(expectedError);
        const errorProcessorUtilityStringifyMethod = jest
            .spyOn(ErrorProcessorUtility, 'stringify')
            .mockReturnValue('expected-error-message');

        await expect(handler.execute(new DeleteProtocolTunnelJumpCommand('transaction-1', 100, 123))).rejects.toThrow(
            expectedError,
        );

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(
            new BTDeleteProtocolTunnelJumpCommand('transaction-1', 123),
        );
        expect(protocolTunnelJumpRepositoryServiceDeleteByIdMethod).toHaveBeenCalledWith(100, 123);
        expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
        expect(eventBusPublishMethod).toHaveBeenCalledWith(
            expect.objectContaining({
                transactionId: 'transaction-1',
                eventType: ProtocolTunnelJumpDeletionFailedEvent.EVENT_TYPE,
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

function mockProtocolTunnelJumpRepositoryService(): ProtocolTunnelJumpRepositoryService {
    const service = {} as ProtocolTunnelJumpRepositoryService;
    service.deleteById = jest.fn().mockReturnValue(Promise.resolve());

    return service;
}
