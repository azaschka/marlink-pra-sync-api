import { EventBus } from '@nestjs/cqrs';
import { BeyondtrustInstanceCreatedEvent } from '../../../beyondtrust-instance/events';
import { BeyondtrustInstance } from '../../../beyondtrust-instance/models';
import { TenantTableCreatedEvent, TenantTableCreationFailedEvent } from '../../../shared/events';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpGroupRepositoryService } from '../../repositories/services/jump-group-repository.service';
import { CreateJumpGroupTenantTableEventHandler } from './create-jump-group-tenant-table.event-handler';

describe('CreateJumpGroupTenantTableEventHandler', () => {
    let handler: CreateJumpGroupTenantTableEventHandler;
    let jumpGroupRepositoryService: JumpGroupRepositoryService;
    let eventBus: EventBus;

    beforeEach(() => {
        jumpGroupRepositoryService = mockJumpGroupRepositoryService();
        eventBus = mockEventBus();

        handler = new CreateJumpGroupTenantTableEventHandler(jumpGroupRepositoryService, eventBus);
    });

    describe('handle', () => {
        it('should create and connect the tenant table and publish a success event', async () => {
            const jumpGroupRepositoryServiceCreateAndConnectTableMethod = jest.spyOn(
                jumpGroupRepositoryService,
                'createAndConnectTable',
            );
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

            await handler.handle(
                new BeyondtrustInstanceCreatedEvent('transaction-1', {
                    beyondtrustInstance: { id: 123 } as BeyondtrustInstance,
                }),
            );

            expect(jumpGroupRepositoryServiceCreateAndConnectTableMethod).toHaveBeenCalledWith(123);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining(<TenantTableCreatedEvent>{
                    transactionId: 'transaction-1',
                    eventType: TenantTableCreatedEvent.EVENT_TYPE,
                    payload: {
                        tenantId: 123,
                        tableName: 'table_tenant',
                    },
                }),
            );
        });

        it('should publish a failure event if creating and connecting the tenant table fails', async () => {
            jest.spyOn(jumpGroupRepositoryService, 'createAndConnectTable').mockRejectedValue(new Error('DB error'));
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            ErrorProcessorUtility.stringify = jest.fn().mockReturnValue('Error: DB error');

            await handler.handle(
                new BeyondtrustInstanceCreatedEvent('transaction-1', {
                    beyondtrustInstance: { id: 123 } as BeyondtrustInstance,
                }),
            );

            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining(<TenantTableCreationFailedEvent>{
                    transactionId: 'transaction-1',
                    eventType: TenantTableCreationFailedEvent.EVENT_TYPE,
                    payload: {
                        tenantId: 123,
                        errorMessage: 'Error: DB error',
                    },
                }),
            );
        });
    });
});

function mockEventBus() {
    const service = {} as EventBus;
    service.publish = jest.fn().mockResolvedValue(Promise.resolve());

    return service;
}

function mockJumpGroupRepositoryService(): JumpGroupRepositoryService {
    const service = {} as JumpGroupRepositoryService;
    service.createAndConnectTable = jest.fn().mockResolvedValue({ tableName: 'table_tenant' });

    return service;
}
