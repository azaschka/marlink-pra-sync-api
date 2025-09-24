import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { CopyRemoteVncCommand as BTCopyRemoteVncCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/remote-vnc/commands';
import {
    RemoteVncCopiedDtoOutput,
    RemoteVncRetrievedDtoOutput,
} from '../../../../beyondtrust-pra-conf-api/jump-item/remote-vnc/dtos/outputs';
import { JumpGroupType as BTJumpGroupType } from '../../../../beyondtrust-pra-conf-api/jump-item/remote-vnc/enums';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { JumpGroupType } from '../../enums';
import { RemoteVncCopiedEvent, RemoteVncCopyFailedEvent } from '../../events';
import { RemoteVncEntity } from '../../repositories/entities';
import { RemoteVncRepositoryService } from '../../repositories/services/remote-vnc-repository.service';
import { CopyRemoteVncCommand } from '../copy-remote-vnc.command';
import { CopyRemoteVncCommandHandler } from './copy-remote-vnc.command-handler';

// Mock mapper function to return original/input value
jest.mock('../../mappers', () => ({
    mapFromBTJumpGroupType: jest.fn().mockImplementation((type: BTJumpGroupType) => type),
    mapToBTJumpGroupType: jest.fn().mockImplementation((type: JumpGroupType) => type),
}));

abstract class TestHelper {
    public static get mockedRemoteVncCopiedDtoOutput(): RemoteVncCopiedDtoOutput {
        return {
            action: 'copy',
            success: 'success',
            destId: 1,
        };
    }

    public static get mockedRemoteVncRetrievedDtoOutput(): RemoteVncRetrievedDtoOutput {
        return {
            id: 1,
            name: 'remote-vnc-1',
            jumpointId: 2,
            hostname: 'hostname-1',
            port: 5900,
            jumpGroupId: 3,
            jumpGroupType: BTJumpGroupType.Personal,
            tag: 'tag-1',
            comments: 'comments-1',
            jumpPolicyId: 3,
            sessionPolicyId: 4,
        };
    }
}

describe('CopyRemoteVncCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let queryBus: QueryBus;
    let remoteVncRepositoryService: RemoteVncRepositoryService;
    let handler: CopyRemoteVncCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        queryBus = mockQueryBus();
        remoteVncRepositoryService = mockRemoteVncRepositoryService();
        handler = new CopyRemoteVncCommandHandler(commandBus, eventBus, queryBus, remoteVncRepositoryService);
    });

    describe('execute', () => {
        it('should call the command bus and repository service with correct parameters, publish an event and return the result', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

            const remoteVncEntityToBeCreated = { id: 123 } as RemoteVncEntity;
            const remoteVncEntityCreateMethod = jest
                .spyOn(RemoteVncEntity, 'create')
                .mockReturnValue(remoteVncEntityToBeCreated);

            const expectedResult = { id: 321 } as RemoteVncEntity;
            const remoteVncRepositoryServiceCreateMethod = jest
                .spyOn(remoteVncRepositoryService, 'create')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await handler.execute(<CopyRemoteVncCommand>{
                transactionId: 'transaction-1',
                tenantId: 123,
                id: 1,
                jumpGroupId: 3,
                jumpGroupType: JumpGroupType.Personal,
                name: 'remote-vnc-1',
            });

            // Assert
            expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                new BTCopyRemoteVncCommand('transaction-1', 1, 3, JumpGroupType.Personal, 'remote-vnc-1'),
            );
            expect(remoteVncEntityCreateMethod).toHaveBeenCalledWith(
                TestHelper.mockedRemoteVncRetrievedDtoOutput.id,
                TestHelper.mockedRemoteVncRetrievedDtoOutput.name,
                TestHelper.mockedRemoteVncRetrievedDtoOutput.jumpointId,
                TestHelper.mockedRemoteVncRetrievedDtoOutput.hostname,
                TestHelper.mockedRemoteVncRetrievedDtoOutput.port,
                TestHelper.mockedRemoteVncRetrievedDtoOutput.jumpGroupId,
                TestHelper.mockedRemoteVncRetrievedDtoOutput.jumpGroupType,
                TestHelper.mockedRemoteVncRetrievedDtoOutput.tag,
                TestHelper.mockedRemoteVncRetrievedDtoOutput.comments,
                TestHelper.mockedRemoteVncRetrievedDtoOutput.jumpPolicyId,
                TestHelper.mockedRemoteVncRetrievedDtoOutput.sessionPolicyId,
            );
            expect(remoteVncRepositoryServiceCreateMethod).toHaveBeenCalledWith(123, remoteVncEntityToBeCreated);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining(<RemoteVncCopiedEvent>{
                    transactionId: 'transaction-1',
                    eventType: RemoteVncCopiedEvent.EVENT_TYPE,
                    payload: {
                        remoteVnc: result,
                        tenantId: 123,
                    },
                }),
            );
            expect(result).toBe(expectedResult);
        });

        it('should throw an error if the command bus fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute').mockRejectedValue(new Error('Error'));

            // Act & Assert
            await expect(
                handler.execute(<CopyRemoteVncCommand>{
                    transactionId: 'transaction-1',
                    name: 'remote-vnc-1',
                }),
            ).rejects.toThrow('Error');
            expect(commandBusExecuteMethod).toHaveBeenCalled();
        });

        it('should throw an error and publish an event if the repository service fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const remoteVncEntityToBeCreated = { name: 'remote-vnc-1', id: 123 } as RemoteVncEntity;
            const remoteVncEntityCreateMethod = jest
                .spyOn(RemoteVncEntity, 'create')
                .mockReturnValue(remoteVncEntityToBeCreated);
            const expectedError = new Error('Error');
            const remoteVncRepositoryServiceCreateMethod = jest
                .spyOn(remoteVncRepositoryService, 'create')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<CopyRemoteVncCommand>{
                    transactionId: 'transaction-1',
                    name: 'remote-vnc-1',
                    tenantId: 123,
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(remoteVncEntityCreateMethod).toHaveBeenCalled();
            expect(remoteVncRepositoryServiceCreateMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: RemoteVncCopyFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        remoteVnc: remoteVncEntityToBeCreated,
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
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedRemoteVncCopiedDtoOutput);

    return commandBus;
}

function mockQueryBus() {
    const queryBus = {} as QueryBus;
    queryBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedRemoteVncRetrievedDtoOutput);

    return queryBus;
}

function mockRemoteVncRepositoryService() {
    const remoteVncRepositoryService = {} as RemoteVncRepositoryService;
    remoteVncRepositoryService.create = jest.fn();

    return remoteVncRepositoryService;
}
