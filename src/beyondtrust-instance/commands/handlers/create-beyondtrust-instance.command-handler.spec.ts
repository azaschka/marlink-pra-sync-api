import { EventBus } from '@nestjs/cqrs';
import { BillingType, BusinessUnit } from '../../enums';
import { BeyondtrustInstanceCreatedEvent } from '../../events';
import { BeyondtrustInstanceEntity } from '../../repositories/entities';
import { BeyondtrustInstanceRepositoryService } from '../../repositories/services/beyondtrust-instance-repository.service';
import { CreateBeyondtrustInstanceCommand } from '../create-beyondtrust-instance.command';
import { CreateBeyondtrustInstanceCommandHandler } from './create-beyondtrust-instance.command-handler';

describe('CreateBeyondtrustInstanceCommandHandler', () => {
    let eventBus: EventBus;
    let beyondtrustInstanceRepositoryService: BeyondtrustInstanceRepositoryService;
    let handler: CreateBeyondtrustInstanceCommandHandler;

    beforeEach(() => {
        eventBus = mockEventBus();
        beyondtrustInstanceRepositoryService = mockBeyondtrustInstanceRepositoryService();
        handler = new CreateBeyondtrustInstanceCommandHandler(eventBus, beyondtrustInstanceRepositoryService);
    });

    describe('execute', () => {
        it('should call the repository service with correct parameters, publish an event and return the result', async () => {
            // Arrange
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const beyondtrustInstanceEntityToBeCreated = { id: 123 } as BeyondtrustInstanceEntity;
            const beyondtrustInstanceEntityCreateWithoutIdMethod = jest
                .spyOn(BeyondtrustInstanceEntity, 'createWithoutId')
                .mockReturnValue(beyondtrustInstanceEntityToBeCreated);
            const expectedResult = { id: 321 } as BeyondtrustInstanceEntity;
            const beyondtrustInstanceRepositoryServiceCreateMethod = jest
                .spyOn(beyondtrustInstanceRepositoryService, 'create')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await handler.execute(
                new CreateBeyondtrustInstanceCommand(
                    'transaction-1',
                    'beyondtrust-instance-1',
                    'auth-client-id-1',
                    'auth-client-secret-1',
                    'https://oauth2.example.com/token',
                    'https://api.example.com',
                    BillingType.Asset,
                    BusinessUnit.EG,
                    'https://pra.example.com',
                ),
            );

            // Assert
            expect(beyondtrustInstanceEntityCreateWithoutIdMethod).toHaveBeenCalledWith(
                'beyondtrust-instance-1',
                'auth-client-id-1',
                'auth-client-secret-1',
                'https://oauth2.example.com/token',
                'https://api.example.com',
                BillingType.Asset,
                BusinessUnit.EG,
                'https://pra.example.com',
            );
            expect(beyondtrustInstanceRepositoryServiceCreateMethod).toHaveBeenCalledWith(
                beyondtrustInstanceEntityToBeCreated,
            );
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining(<BeyondtrustInstanceCreatedEvent>(<unknown>{
                    transactionId: 'transaction-1',
                    eventType: BeyondtrustInstanceCreatedEvent.EVENT_TYPE,
                    payload: {
                        beyondtrustInstance: expectedResult,
                    },
                })),
            );
            expect(result).toBe(expectedResult);
        });

        it('should throw an error if the repository fails', async () => {
            // Arrange
            const beyondtrustInstanceRepositoryServiceCreateMethod = jest
                .spyOn(beyondtrustInstanceRepositoryService, 'create')
                .mockRejectedValue(new Error('Error'));

            // Act & Assert
            await expect(
                handler.execute(<CreateBeyondtrustInstanceCommand>{
                    transactionId: 'transaction-1',
                    name: 'beyondtrust-instance-1',
                }),
            ).rejects.toThrow();
            expect(beyondtrustInstanceRepositoryServiceCreateMethod).toHaveBeenCalled();
        });
    });
});

function mockEventBus() {
    const eventBus = {} as EventBus;
    eventBus.publish = jest.fn();

    return eventBus;
}

function mockBeyondtrustInstanceRepositoryService() {
    const beyondtrustInstanceRepositoryService = {} as BeyondtrustInstanceRepositoryService;
    beyondtrustInstanceRepositoryService.create = jest.fn();

    return beyondtrustInstanceRepositoryService;
}
