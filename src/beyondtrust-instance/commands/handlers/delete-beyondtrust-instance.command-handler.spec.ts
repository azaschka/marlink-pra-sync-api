import { NotFoundException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { BeyondtrustInstanceDeletedEvent } from '../../events';
import { BeyondtrustInstanceEntity } from '../../repositories/entities';
import { BeyondtrustInstanceRepositoryService } from '../../repositories/services/beyondtrust-instance-repository.service';
import { DeleteBeyondtrustInstanceCommand } from '../delete-beyondtrust-instance.command';
import { DeleteBeyondtrustInstanceCommandHandler } from './delete-beyondtrust-instance.command-handler';

describe('DeleteBeyondtrustInstanceCommandHandler', () => {
    let eventBus: EventBus;
    let beyondtrustInstanceRepositoryService: BeyondtrustInstanceRepositoryService;
    let handler: DeleteBeyondtrustInstanceCommandHandler;

    beforeEach(() => {
        eventBus = mockEventBus();
        beyondtrustInstanceRepositoryService = mockBeyondtrustInstanceRepositoryService();
        handler = new DeleteBeyondtrustInstanceCommandHandler(eventBus, beyondtrustInstanceRepositoryService);
    });

    it('should throw NotFoundException if instance not found', async () => {
        await expect(handler.execute(new DeleteBeyondtrustInstanceCommand('transaction-1', 123))).rejects.toThrow(
            NotFoundException,
        );
    });

    it('should delete data from db and publish an event', async () => {
        const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
        const beyondtrustInstanceRepositoryServiceDeleteByIdMethod = jest.spyOn(
            beyondtrustInstanceRepositoryService,
            'deleteById',
        );
        const beyondtrustInstanceRepositoryServiceFindOneByIdMethod = jest
            .spyOn(beyondtrustInstanceRepositoryService, 'findOneById')
            .mockResolvedValue({ id: 123 } as BeyondtrustInstanceEntity);

        await handler.execute(new DeleteBeyondtrustInstanceCommand('transaction-1', 123));

        expect(beyondtrustInstanceRepositoryServiceFindOneByIdMethod).toHaveBeenCalledWith(123);
        expect(beyondtrustInstanceRepositoryServiceDeleteByIdMethod).toHaveBeenCalledWith(123);
        expect(eventBusPublishMethod).toHaveBeenCalledWith(
            expect.objectContaining(<BeyondtrustInstanceDeletedEvent>{
                transactionId: 'transaction-1',
                eventType: BeyondtrustInstanceDeletedEvent.EVENT_TYPE,
                payload: {
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

function mockBeyondtrustInstanceRepositoryService(): BeyondtrustInstanceRepositoryService {
    const service = {} as BeyondtrustInstanceRepositoryService;
    service.deleteById = jest.fn().mockReturnValue(Promise.resolve());
    service.findOneById = jest.fn().mockResolvedValue(null);

    return service;
}
