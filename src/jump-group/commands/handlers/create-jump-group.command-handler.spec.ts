import { HttpException, HttpStatus } from '@nestjs/common';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { CreateJumpGroupCommand as BTCreateJumpGroupCommand } from '../../../beyondtrust-pra-conf-api/jump-group/commands';
import {
    JumpGroupCreatedDtoOutput,
    JumpGroupRetrievedDtoOutput,
} from '../../../beyondtrust-pra-conf-api/jump-group/dtos/outputs';
import { RetrieveJumpGroupsQuery as BTRetrieveJumpGroupsQuery } from '../../../beyondtrust-pra-conf-api/jump-group/queries';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpGroupCreatedEvent, JumpGroupCreationFailedEvent } from '../../events';
import { JumpGroupEntity } from '../../repositories/entities';
import { JumpGroupRepositoryService } from '../../repositories/services/jump-group-repository.service';
import { CreateJumpGroupCommand } from '../create-jump-group.command';
import { CreateJumpGroupCommandHandler } from './create-jump-group.command-handler';

/* eslint-disable @typescript-eslint/unbound-method */

abstract class TestHelper {
    public static get mockedJumpGroupCreatedDtoOutput(): JumpGroupCreatedDtoOutput {
        return {
            id: 1,
            name: 'jump-group-1',
            codeName: 'jump-group-code-1',
            comments: 'jump-group-comments-1',
        };
    }
}

describe('CreateJumpGroupCommandHandler', () => {
    let commandBus: CommandBus;
    let queryBus: QueryBus;
    let eventBus: EventBus;
    let jumpGroupRepositoryService: JumpGroupRepositoryService;
    let handler: CreateJumpGroupCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        queryBus = mockQueryBus();
        eventBus = mockEventBus();
        jumpGroupRepositoryService = mockJumpGroupRepositoryService();
        handler = new CreateJumpGroupCommandHandler(commandBus, queryBus, eventBus, jumpGroupRepositoryService);
    });

    describe('execute', () => {
        it.each([
            <CreateJumpGroupCommand>{
                transactionId: 'transaction-1',
                tenantId: 123,
                name: 'jump-group-1',
                codeName: 'jump-group-code-1',
                comments: 'jump-group-comments-1',
            },
            <CreateJumpGroupCommand>{
                transactionId: 'transaction-2',
                tenantId: 123,
                name: 'jump-group-2',
            },
        ])(
            'should call the command bus and repository service with correct parameters, publish an event and return the result',
            async (command) => {
                // Arrange

                jest.spyOn(commandBus, 'execute');

                jest.spyOn(eventBus, 'publish');

                const jumpGroupEntityToBeCreated = { id: 123 } as JumpGroupEntity;

                jest.spyOn(JumpGroupEntity, 'create').mockReturnValue(jumpGroupEntityToBeCreated);

                const expectedResult = { id: 321 } as JumpGroupEntity;

                jest.spyOn(jumpGroupRepositoryService, 'create').mockResolvedValue(expectedResult);

                // Act
                const result = await handler.execute(command);

                // Assert
                expect(commandBus.execute).toHaveBeenCalledWith(
                    new BTCreateJumpGroupCommand(
                        command.transactionId,
                        command.tenantId,
                        command.name,
                        command.codeName,
                        command.comments,
                    ),
                );
                expect(JumpGroupEntity.create).toHaveBeenCalledWith(
                    TestHelper.mockedJumpGroupCreatedDtoOutput.id,
                    TestHelper.mockedJumpGroupCreatedDtoOutput.name,
                    TestHelper.mockedJumpGroupCreatedDtoOutput.codeName,
                    TestHelper.mockedJumpGroupCreatedDtoOutput.comments,
                );
                expect(jumpGroupRepositoryService.create).toHaveBeenCalledWith(123, jumpGroupEntityToBeCreated);
                expect(eventBus.publish).toHaveBeenCalledWith(
                    expect.objectContaining(<JumpGroupCreatedEvent>{
                        transactionId: command.transactionId,
                        eventType: JumpGroupCreatedEvent.EVENT_TYPE,
                        payload: {
                            jumpGroup: result,
                            tenantId: 123,
                        },
                    }),
                );
                expect(result).toBe(expectedResult);
            },
        );

        it('should throw an error if the command bus fails with a non-422 error', async () => {
            // Arrange

            jest.spyOn(commandBus, 'execute').mockRejectedValue(new Error('Error'));

            // Act & Assert
            await expect(
                handler.execute(<CreateJumpGroupCommand>{
                    transactionId: 'transaction-1',
                    name: 'jump-group-1',
                }),
            ).rejects.toThrow('Error');
            expect(commandBus.execute).toHaveBeenCalled();
        });

        it('should fetch existing jump group from BeyondTrust and upsert to local DB when BT returns 422 name-already-taken', async () => {
            // Arrange
            const command = <CreateJumpGroupCommand>{
                transactionId: 'transaction-1',
                tenantId: 123,
                name: 'jump-group-1',
                codeName: 'jump-group-code-1',
                comments: 'jump-group-comments-1',
            };

            const alreadyTakenError = new HttpException({}, HttpStatus.UNPROCESSABLE_ENTITY);
            jest.spyOn(commandBus, 'execute').mockRejectedValue(alreadyTakenError);

            const existingBTJumpGroup: JumpGroupRetrievedDtoOutput = {
                id: 1,
                name: 'jump-group-1',
                codeName: 'jump-group-code-1',
                comments: 'jump-group-comments-1',
            };
            jest.spyOn(queryBus, 'execute').mockResolvedValue([existingBTJumpGroup]);

            const jumpGroupEntityToBeUpserted = { id: 1, name: 'jump-group-1' } as JumpGroupEntity;
            jest.spyOn(JumpGroupEntity, 'create').mockReturnValue(jumpGroupEntityToBeUpserted);

            // Act
            const result = await handler.execute(command);

            // Assert
            expect(queryBus.execute).toHaveBeenCalledWith(
                new BTRetrieveJumpGroupsQuery(command.transactionId, command.tenantId, 1, 1, command.name),
            );
            expect(jumpGroupRepositoryService.createOrUpdateById).toHaveBeenCalledWith(
                command.tenantId,
                jumpGroupEntityToBeUpserted,
            );
            expect(jumpGroupRepositoryService.create).not.toHaveBeenCalled();
            expect(eventBus.publish).toHaveBeenCalledWith(
                expect.objectContaining(<JumpGroupCreatedEvent>{
                    transactionId: command.transactionId,
                    eventType: JumpGroupCreatedEvent.EVENT_TYPE,
                    payload: { jumpGroup: jumpGroupEntityToBeUpserted, tenantId: 123 },
                }),
            );
            expect(result).toBe(jumpGroupEntityToBeUpserted);
        });

        it('should rethrow 422 error if jump group cannot be found in BeyondTrust after name-already-taken', async () => {
            // Arrange
            const command = <CreateJumpGroupCommand>{
                transactionId: 'transaction-1',
                tenantId: 123,
                name: 'jump-group-1',
            };

            const alreadyTakenError = new HttpException({}, HttpStatus.UNPROCESSABLE_ENTITY);
            jest.spyOn(commandBus, 'execute').mockRejectedValue(alreadyTakenError);
            jest.spyOn(queryBus, 'execute').mockResolvedValue([]);

            // Act & Assert
            await expect(handler.execute(command)).rejects.toThrow(alreadyTakenError);
            expect(queryBus.execute).toHaveBeenCalledWith(
                new BTRetrieveJumpGroupsQuery(command.transactionId, command.tenantId, 1, 1, command.name),
            );
            expect(jumpGroupRepositoryService.createOrUpdateById).not.toHaveBeenCalled();
            expect(jumpGroupRepositoryService.create).not.toHaveBeenCalled();
        });

        it('should throw an error and publish an event if the repository service fails', async () => {
            // Arrange

            jest.spyOn(commandBus, 'execute');
            const jumpGroupEntityToBeCreated = { name: 'jump-group-1', id: 123 } as JumpGroupEntity;

            jest.spyOn(JumpGroupEntity, 'create').mockReturnValue(jumpGroupEntityToBeCreated);
            const expectedError = new Error('Error');

            jest.spyOn(jumpGroupRepositoryService, 'create').mockRejectedValue(expectedError);

            jest.spyOn(eventBus, 'publish');

            jest.spyOn(ErrorProcessorUtility, 'stringify').mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<CreateJumpGroupCommand>{
                    transactionId: 'transaction-1',
                    name: 'jump-group-1',
                    tenantId: 123,
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBus.execute).toHaveBeenCalled();
            expect(JumpGroupEntity.create).toHaveBeenCalled();
            expect(jumpGroupRepositoryService.create).toHaveBeenCalled();
            expect(ErrorProcessorUtility.stringify).toHaveBeenCalledWith(expectedError);
            expect(eventBus.publish).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: JumpGroupCreationFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        jumpGroup: jumpGroupEntityToBeCreated,
                        tenantId: 123,
                    },
                }),
            );
        });
    });
});

function mockEventBus() {
    const eventBus = {} as EventBus;
    eventBus.publish = jest.fn();

    return eventBus;
}

function mockCommandBus() {
    const commandBus = {} as CommandBus;
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedJumpGroupCreatedDtoOutput);

    return commandBus;
}

function mockQueryBus() {
    const queryBus = {} as QueryBus;
    queryBus.execute = jest.fn().mockResolvedValue([]);

    return queryBus;
}
/* eslint-enable @typescript-eslint/unbound-method */

function mockJumpGroupRepositoryService() {
    const jumpGroupRepositoryService = {} as JumpGroupRepositoryService;
    jumpGroupRepositoryService.create = jest.fn();
    jumpGroupRepositoryService.createOrUpdateById = jest.fn().mockResolvedValue(undefined);

    return jumpGroupRepositoryService;
}
