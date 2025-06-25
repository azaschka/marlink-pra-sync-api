import { NotFoundException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { BeyondtrustInstanceModifiedEvent } from '../../events';
import { BeyondtrustInstanceEntity } from '../../repositories/entities';
import { BeyondtrustInstanceRepositoryService } from '../../repositories/services/beyondtrust-instance-repository.service';
import { ModifyBeyondtrustInstanceCommand } from '../modify-beyondtrust-instance.command';
import { ModifyBeyondtrustInstanceCommandHandler } from './modify-beyondtrust-instance.command-handler';

describe('ModifyBeyondtrustInstanceCommandHandler', () => {
    let eventBus: EventBus;
    let beyondtrustInstanceRepositoryService: BeyondtrustInstanceRepositoryService;
    let handler: ModifyBeyondtrustInstanceCommandHandler;

    beforeEach(() => {
        eventBus = mockEventBus();
        beyondtrustInstanceRepositoryService = mockBeyondtrustInstanceRepositoryService();
        handler = new ModifyBeyondtrustInstanceCommandHandler(eventBus, beyondtrustInstanceRepositoryService);
    });

    describe('execute', () => {
        it('should throw NotFoundException if instance not found', async () => {
            // Arrange
            const beyondtrustInstanceRepositoryServiceFindOneByIdMethod = jest.spyOn(
                beyondtrustInstanceRepositoryService,
                'findOneById',
            );

            // Act & Assert
            await expect(
                handler.execute(new ModifyBeyondtrustInstanceCommand('transaction-1', 123, 'beyondtrust-instance-1')),
            ).rejects.toThrow(NotFoundException);
            expect(beyondtrustInstanceRepositoryServiceFindOneByIdMethod).toHaveBeenCalledWith(123);
        });

        it('should throw an error if the repository fails', async () => {
            // Arrange
            const beyondtrustInstanceRepositoryServiceFindOneByIdMethod = jest
                .spyOn(beyondtrustInstanceRepositoryService, 'findOneById')
                .mockResolvedValue({ id: 123 } as BeyondtrustInstanceEntity);
            const expectedError = new Error('Error');
            const beyondtrustInstanceRepositoryServiceCreateOrUpdateByIdMethod = jest
                .spyOn(beyondtrustInstanceRepositoryService, 'createOrUpdateById')
                .mockRejectedValue(expectedError);

            // Act & Assert
            await expect(
                handler.execute(<ModifyBeyondtrustInstanceCommand>{
                    transactionId: 'transaction-1',
                    id: 123,
                    name: 'beyondtrust-instance-1',
                }),
            ).rejects.toThrow(expectedError);
            expect(beyondtrustInstanceRepositoryServiceFindOneByIdMethod).toHaveBeenCalledWith(123);
            expect(beyondtrustInstanceRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalled();
        });

        it('should call the repository service with correct parameters, publish an event and return the result', async () => {
            // Arrange
            const beyondtrustInstanceRepositoryServiceFindOneByIdMethod = jest
                .spyOn(beyondtrustInstanceRepositoryService, 'findOneById')
                .mockResolvedValue({ id: 123 } as BeyondtrustInstanceEntity);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const beyondtrustInstanceEntityToBeCreated = { id: 123 } as BeyondtrustInstanceEntity;
            const beyondtrustInstanceEntityCreateMethod = jest
                .spyOn(BeyondtrustInstanceEntity, 'create')
                .mockReturnValue(beyondtrustInstanceEntityToBeCreated);
            const beyondtrustInstanceRepositoryServiceCreateOrUpdateByIdMethod = jest.spyOn(
                beyondtrustInstanceRepositoryService,
                'createOrUpdateById',
            );

            // Act
            const result = await handler.execute(
                new ModifyBeyondtrustInstanceCommand(
                    'transaction-1',
                    123,
                    'beyondtrust-instance-2',
                    'auth-client-id-2',
                    'auth-client-secret-2',
                    'https://oauth2.example2.com/token',
                    'https://api.example2.com',
                ),
            );

            // Assert
            expect(beyondtrustInstanceRepositoryServiceFindOneByIdMethod).toHaveBeenCalledWith(123);
            expect(beyondtrustInstanceEntityCreateMethod).toHaveBeenCalledWith(
                123,
                'beyondtrust-instance-2',
                'auth-client-id-2',
                'auth-client-secret-2',
                'https://oauth2.example2.com/token',
                'https://api.example2.com',
            );
            expect(beyondtrustInstanceRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalledWith(
                beyondtrustInstanceEntityToBeCreated,
            );
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining(<BeyondtrustInstanceModifiedEvent>{
                    transactionId: 'transaction-1',
                    eventType: BeyondtrustInstanceModifiedEvent.EVENT_TYPE,
                    payload: {
                        beyondtrustInstance: beyondtrustInstanceEntityToBeCreated,
                    },
                }),
            );
            expect(result).toBe(beyondtrustInstanceEntityToBeCreated);
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
    beyondtrustInstanceRepositoryService.createOrUpdateById = jest.fn();
    beyondtrustInstanceRepositoryService.findOneById = jest.fn().mockResolvedValue(null);

    return beyondtrustInstanceRepositoryService;
}
