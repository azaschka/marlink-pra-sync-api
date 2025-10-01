import { EventBus } from '@nestjs/cqrs';
import { BeyondtrustInstanceCreatedEvent } from '../../../beyondtrust-instance/events';
import { BeyondtrustInstance } from '../../../beyondtrust-instance/models';
import { TenantTableCreatedEvent, TenantTableCreationFailedEvent } from '../../../shared/events';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpClientInstallerRepositoryService } from '../../repositories/services/jump-client-installer-repository.service';
import { CreateJumpClientInstallerTenantTableEventHandler } from './create-jump-client-installer-tenant-table.event-handler';

describe('CreateJumpClientInstallerTenantTableEventHandler', () => {
    let handler: CreateJumpClientInstallerTenantTableEventHandler;
    let jumpClientRepositoryService: JumpClientInstallerRepositoryService;
    let eventBus: EventBus;

    beforeEach(() => {
        jumpClientRepositoryService = mockJumpClientInstallerRepositoryService();
        eventBus = mockEventBus();

        handler = new CreateJumpClientInstallerTenantTableEventHandler(jumpClientRepositoryService, eventBus);
    });

    describe('handle', () => {
        it('should create and connect the tenant table and publish a success event', async () => {
            const jumpClientRepositoryServiceCreateAndConnectTableMethod = jest.spyOn(
                jumpClientRepositoryService,
                'createAndConnectTable',
            );
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

            await handler.handle(
                new BeyondtrustInstanceCreatedEvent('transaction-1', {
                    beyondtrustInstance: { id: 123 } as BeyondtrustInstance,
                }),
            );

            expect(jumpClientRepositoryServiceCreateAndConnectTableMethod).toHaveBeenCalledWith(123);
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
            jest.spyOn(jumpClientRepositoryService, 'createAndConnectTable').mockRejectedValue(new Error('DB error'));
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

function mockJumpClientInstallerRepositoryService(): JumpClientInstallerRepositoryService {
    const service = {} as JumpClientInstallerRepositoryService;
    service.createAndConnectTable = jest.fn().mockResolvedValue({ tableName: 'table_tenant' });

    return service;
}
