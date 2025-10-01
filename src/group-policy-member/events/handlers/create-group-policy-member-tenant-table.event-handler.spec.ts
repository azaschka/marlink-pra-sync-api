import { EventBus } from '@nestjs/cqrs';
import { BeyondtrustInstanceCreatedEvent } from '../../../beyondtrust-instance/events';
import { BeyondtrustInstance } from '../../../beyondtrust-instance/models';
import { TenantTableCreatedEvent, TenantTableCreationFailedEvent } from '../../../shared/events';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { GroupPolicyMemberRepositoryService } from '../../repositories/services/group-policy-member-repository.service';
import { CreateGroupPolicyMemberTenantTableEventHandler } from './create-group-policy-member-tenant-table.event-handler';

describe('CreateGroupPolicyMemberTenantTableEventHandler', () => {
    let handler: CreateGroupPolicyMemberTenantTableEventHandler;
    let groupPolicyMemberRepositoryService: GroupPolicyMemberRepositoryService;
    let eventBus: EventBus;

    beforeEach(() => {
        groupPolicyMemberRepositoryService = mockGroupPolicyMemberRepositoryService();
        eventBus = mockEventBus();

        handler = new CreateGroupPolicyMemberTenantTableEventHandler(groupPolicyMemberRepositoryService, eventBus);
    });

    describe('handle', () => {
        it('should create and connect the tenant table and publish a success event', async () => {
            const groupPolicyMemberRepositoryServiceCreateAndConnectTableMethod = jest.spyOn(
                groupPolicyMemberRepositoryService,
                'createAndConnectTable',
            );
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

            await handler.handle(
                new BeyondtrustInstanceCreatedEvent('transaction-1', {
                    beyondtrustInstance: { id: 123 } as BeyondtrustInstance,
                }),
            );

            expect(groupPolicyMemberRepositoryServiceCreateAndConnectTableMethod).toHaveBeenCalledWith(123);
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
            jest.spyOn(groupPolicyMemberRepositoryService, 'createAndConnectTable').mockRejectedValue(
                new Error('DB error'),
            );
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

function mockGroupPolicyMemberRepositoryService(): GroupPolicyMemberRepositoryService {
    const service = {} as GroupPolicyMemberRepositoryService;
    service.createAndConnectTable = jest.fn().mockResolvedValue({ tableName: 'table_tenant' });

    return service;
}
