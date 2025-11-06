import { CommandBus, EventBus } from '@nestjs/cqrs';
import { DeleteJumpPolicyCommand as BTDeleteJumpPolicyCommand } from '../../../beyondtrust-pra-conf-api/jump-policy/commands';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpPolicyDeletedEvent, JumpPolicyDeletionFailedEvent } from '../../events';
import { JumpPolicyRepositoryService } from '../../repositories/services/jump-policy-repository.service';
import { DeleteJumpPolicyCommand } from '../delete-jump-policy.command';
import { DeleteJumpPolicyCommandHandler } from './delete-jump-policy.command-handler';

describe('DeleteJumpPolicyCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let jumpPolicyRepositoryService: JumpPolicyRepositoryService;
    let handler: DeleteJumpPolicyCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        jumpPolicyRepositoryService = mockJumpPolicyRepositoryService();
        handler = new DeleteJumpPolicyCommandHandler(commandBus, eventBus, jumpPolicyRepositoryService);
    });

    it('should call the command bus with correct parameters, delete data from db and publish an event', async () => {
        const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
        const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
        const jumpPolicyRepositoryServiceDeleteByIdMethod = jest.spyOn(jumpPolicyRepositoryService, 'deleteById');

        await handler.execute(new DeleteJumpPolicyCommand('transaction-1', 100, 123));

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(new BTDeleteJumpPolicyCommand('transaction-1', 100, 123));
        expect(jumpPolicyRepositoryServiceDeleteByIdMethod).toHaveBeenCalledWith(100, 123);
        expect(eventBusPublishMethod).toHaveBeenCalledWith(
            expect.objectContaining(<JumpPolicyDeletedEvent>{
                transactionId: 'transaction-1',
                eventType: JumpPolicyDeletedEvent.EVENT_TYPE,
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
        const jumpPolicyRepositoryServiceDeleteByIdMethod = jest.spyOn(jumpPolicyRepositoryService, 'deleteById');

        await expect(handler.execute(new DeleteJumpPolicyCommand('transaction-1', 100, 123))).rejects.toThrow(
            expectedError,
        );

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(new BTDeleteJumpPolicyCommand('transaction-1', 100, 123));
        expect(jumpPolicyRepositoryServiceDeleteByIdMethod).not.toHaveBeenCalled();
        expect(eventBusPublishMethod).not.toHaveBeenCalled();
    });

    it('should publish an error event and throw an error if the repository fails', async () => {
        const expectedError = new Error('Repository error');
        const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
        const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
        const jumpPolicyRepositoryServiceDeleteByIdMethod = jest
            .spyOn(jumpPolicyRepositoryService, 'deleteById')
            .mockRejectedValue(expectedError);
        const errorProcessorUtilityStringifyMethod = jest
            .spyOn(ErrorProcessorUtility, 'stringify')
            .mockReturnValue('expected-error-message');

        await expect(handler.execute(new DeleteJumpPolicyCommand('transaction-1', 100, 123))).rejects.toThrow(
            expectedError,
        );

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(new BTDeleteJumpPolicyCommand('transaction-1', 100, 123));
        expect(jumpPolicyRepositoryServiceDeleteByIdMethod).toHaveBeenCalledWith(100, 123);
        expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
        expect(eventBusPublishMethod).toHaveBeenCalledWith(
            expect.objectContaining({
                transactionId: 'transaction-1',
                eventType: JumpPolicyDeletionFailedEvent.EVENT_TYPE,
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

function mockJumpPolicyRepositoryService(): JumpPolicyRepositoryService {
    const service = {} as JumpPolicyRepositoryService;
    service.deleteById = jest.fn().mockReturnValue(Promise.resolve());

    return service;
}
