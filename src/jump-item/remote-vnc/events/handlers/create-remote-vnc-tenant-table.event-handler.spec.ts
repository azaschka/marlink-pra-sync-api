import { EventBus } from '@nestjs/cqrs';
import { BeyondtrustInstanceCreatedEvent } from '../../../../beyondtrust-instance/events';
import { BeyondtrustInstance } from '../../../../beyondtrust-instance/models';
import { TenantTableCreatedEvent, TenantTableCreationFailedEvent } from '../../../../shared/events';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { RemoteVncRepositoryService } from '../../repositories/services/remote-vnc-repository.service';
import { CreateRemoteVncTenantTableEventHandler } from './create-remote-vnc-tenant-table.event-handler';

describe('CreateRemoteVncTenantTableEventHandler', () => {
    let handler: CreateRemoteVncTenantTableEventHandler;
    let remoteVncRepositoryService: RemoteVncRepositoryService;
    let eventBus: EventBus;

    beforeEach(() => {
        remoteVncRepositoryService = mockRemoteVncRepositoryService();
        eventBus = mockEventBus();

        handler = new CreateRemoteVncTenantTableEventHandler(remoteVncRepositoryService, eventBus);
    });

    describe('handle', () => {
        it('should create and connect the tenant table and publish a success event', async () => {
            const remoteVncRepositoryServiceCreateAndConnectTableMethod = jest.spyOn(
                remoteVncRepositoryService,
                'createAndConnectTable',
            );
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

            await handler.handle(
                new BeyondtrustInstanceCreatedEvent('transaction-1', {
                    beyondtrustInstance: { id: 123 } as BeyondtrustInstance,
                }),
            );

            expect(remoteVncRepositoryServiceCreateAndConnectTableMethod).toHaveBeenCalledWith(123);
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
            jest.spyOn(remoteVncRepositoryService, 'createAndConnectTable').mockRejectedValue(new Error('DB error'));
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

function mockRemoteVncRepositoryService(): RemoteVncRepositoryService {
    const service = {} as RemoteVncRepositoryService;
    service.createAndConnectTable = jest.fn().mockResolvedValue({ tableName: 'table_tenant' });

    return service;
}
