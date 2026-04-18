import { NotFoundException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { JumpointNodeDeletedEvent, JumpointNodeDeletionFailedEvent } from '../../events';
import { JumpointNodeRepositoryService } from '../../repositories/services/jumpoint-node-repository.service';
import { DeleteJumpointNodeCommand } from '../delete-jumpoint-node.command';
import { DeleteJumpointNodeCommandHandler } from './delete-jumpoint-node.command-handler';

describe('DeleteJumpointNodeCommandHandler', () => {
    let eventBus: EventBus;
    let jumpointNodeRepositoryService: JumpointNodeRepositoryService;
    let handler: DeleteJumpointNodeCommandHandler;

    beforeEach(() => {
        eventBus = mockEventBus();
        jumpointNodeRepositoryService = mockJumpointNodeRepositoryService();
        handler = new DeleteJumpointNodeCommandHandler(eventBus, jumpointNodeRepositoryService);
    });

    it('should throw NotFoundException if the jumpoint node does not exist', async () => {
        jest.spyOn(jumpointNodeRepositoryService, 'findOneById').mockResolvedValue(null);

        await expect(handler.execute(new DeleteJumpointNodeCommand('transaction-1', 123))).rejects.toThrow(
            NotFoundException,
        );
    });

    it('should delete data from db and publish an event', async () => {
        const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
        const jumpointNodeRepositoryServiceDeleteByIdMethod = jest.spyOn(jumpointNodeRepositoryService, 'deleteById');

        await handler.execute(new DeleteJumpointNodeCommand('transaction-1', 123));

        expect(jumpointNodeRepositoryServiceDeleteByIdMethod).toHaveBeenCalledWith(123);
        expect(eventBusPublishMethod).toHaveBeenCalledWith(
            expect.objectContaining(<JumpointNodeDeletedEvent>{
                transactionId: 'transaction-1',
                eventType: JumpointNodeDeletedEvent.EVENT_TYPE,
                payload: {
                    id: 123,
                },
            }),
        );
    });

    it('should publish an error event and throw an error if the repository fails', async () => {
        const expectedError = new Error('Repository error');
        const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
        const jumpointNodeRepositoryServiceDeleteByIdMethod = jest
            .spyOn(jumpointNodeRepositoryService, 'deleteById')
            .mockRejectedValue(expectedError);
        const errorProcessorUtilityStringifyMethod = jest
            .spyOn(ErrorProcessorUtility, 'stringify')
            .mockReturnValue('expected-error-message');

        await expect(handler.execute(new DeleteJumpointNodeCommand('transaction-1', 123))).rejects.toThrow(
            expectedError,
        );

        expect(jumpointNodeRepositoryServiceDeleteByIdMethod).toHaveBeenCalledWith(123);
        expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
        expect(eventBusPublishMethod).toHaveBeenCalledWith(
            expect.objectContaining({
                transactionId: 'transaction-1',
                eventType: JumpointNodeDeletionFailedEvent.EVENT_TYPE,
                payload: {
                    errorMessage: 'expected-error-message',
                    id: 123,
                },
            }),
        );
    });
});

function mockEventBus() {
    const service = {} as EventBus;
    service.publish = jest.fn().mockResolvedValue(Promise.resolve());

    return service;
}

function mockJumpointNodeRepositoryService(): JumpointNodeRepositoryService {
    const service = {} as JumpointNodeRepositoryService;
    service.deleteById = jest.fn().mockReturnValue(Promise.resolve());
    service.findOneById = jest.fn().mockResolvedValue({});

    return service;
}
