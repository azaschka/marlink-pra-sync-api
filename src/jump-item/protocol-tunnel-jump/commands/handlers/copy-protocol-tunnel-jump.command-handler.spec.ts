import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { CopyProtocolTunnelJumpCommand as BTCopyProtocolTunnelJumpCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/protocol-tunnel-jump/commands';
import {
    ProtocolTunnelJumpCopiedDtoOutput,
    ProtocolTunnelJumpRetrievedDtoOutput,
} from '../../../../beyondtrust-pra-conf-api/jump-item/protocol-tunnel-jump/dtos/outputs';
import {
    JumpGroupType as BTJumpGroupType,
    TunnelType as BTTunnelType,
} from '../../../../beyondtrust-pra-conf-api/jump-item/protocol-tunnel-jump/enums';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { JumpGroupType, TunnelType } from '../../enums';
import { ProtocolTunnelJumpCopiedEvent, ProtocolTunnelJumpCopyFailedEvent } from '../../events';
import { ProtocolTunnelJumpEntity } from '../../repositories/entities';
import { ProtocolTunnelJumpRepositoryService } from '../../repositories/services/protocol-tunnel-jump-repository.service';
import { CopyProtocolTunnelJumpCommand } from '../copy-protocol-tunnel-jump.command';
import { CopyProtocolTunnelJumpCommandHandler } from './copy-protocol-tunnel-jump.command-handler';

// Mock mapper function to return original/input value
jest.mock('../../mappers', () => ({
    mapFromBTJumpGroupType: jest.fn().mockImplementation((type: BTJumpGroupType) => type),
    mapToBTJumpGroupType: jest.fn().mockImplementation((type: JumpGroupType) => type),
    mapFromBTTunnelType: jest.fn().mockImplementation((type: BTTunnelType) => type),
    mapToBTTunnelType: jest.fn().mockImplementation((type: TunnelType) => type),
}));

abstract class TestHelper {
    public static get mockedProtocolTunnelJumpCopiedDtoOutput(): ProtocolTunnelJumpCopiedDtoOutput {
        return {
            action: 'copy',
            success: 'success',
            destId: 1,
        };
    }

    public static get mockedProtocolTunnelJumpRetrievedDtoOutput(): ProtocolTunnelJumpRetrievedDtoOutput {
        return {
            id: 1,
            name: 'protocol-tunnel-jump-1',
            hostname: 'hostname-1',
            jumpGroupId: 2,
            jumpointId: 3,
            jumpGroupType: JumpGroupType.Personal,
            tag: 'tag-1',
            comments: 'comments-1',
            jumpPolicyId: 4,
            sessionPolicyId: 5,
            tunnelListenAddress: 'tunnel-listen-address-1',
            tunnelDefinitions: 'tunnel-definitions-1',
            tunnelType: TunnelType.Mssql,
            username: 'username-1',
            database: 'database-1',
            url: 'url-1',
            caCertificates: 'ca-certificates-1',
        };
    }
}

describe('CopyProtocolTunnelJumpCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let queryBus: QueryBus;
    let protocolTunnelJumpRepositoryService: ProtocolTunnelJumpRepositoryService;
    let handler: CopyProtocolTunnelJumpCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        queryBus = mockQueryBus();
        protocolTunnelJumpRepositoryService = mockProtocolTunnelJumpRepositoryService();
        handler = new CopyProtocolTunnelJumpCommandHandler(
            commandBus,
            eventBus,
            queryBus,
            protocolTunnelJumpRepositoryService,
        );
    });

    describe('execute', () => {
        it('should call the command bus and repository service with correct parameters, publish an event and return the result', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

            const protocolTunnelJumpEntityToBeCreated = { id: 123 } as ProtocolTunnelJumpEntity;
            const protocolTunnelJumpEntityCreateMethod = jest
                .spyOn(ProtocolTunnelJumpEntity, 'create')
                .mockReturnValue(protocolTunnelJumpEntityToBeCreated);

            const expectedResult = { id: 321 } as ProtocolTunnelJumpEntity;
            const protocolTunnelJumpRepositoryServiceCreateMethod = jest
                .spyOn(protocolTunnelJumpRepositoryService, 'create')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await handler.execute(<CopyProtocolTunnelJumpCommand>{
                transactionId: 'transaction-1',
                tenantId: 123,
                id: 1,
                jumpGroupId: 3,
                jumpGroupType: JumpGroupType.Personal,
                name: 'protocol-tunnel-jump-1',
            });

            // Assert
            expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                new BTCopyProtocolTunnelJumpCommand(
                    'transaction-1',
                    1,
                    3,
                    JumpGroupType.Personal,
                    'protocol-tunnel-jump-1',
                ),
            );
            expect(protocolTunnelJumpEntityCreateMethod).toHaveBeenCalledWith(
                TestHelper.mockedProtocolTunnelJumpRetrievedDtoOutput.id,
                TestHelper.mockedProtocolTunnelJumpRetrievedDtoOutput.name,
                TestHelper.mockedProtocolTunnelJumpRetrievedDtoOutput.jumpointId,
                TestHelper.mockedProtocolTunnelJumpRetrievedDtoOutput.hostname,
                TestHelper.mockedProtocolTunnelJumpRetrievedDtoOutput.jumpGroupId,
                TestHelper.mockedProtocolTunnelJumpRetrievedDtoOutput.jumpGroupType,
                TestHelper.mockedProtocolTunnelJumpRetrievedDtoOutput.tag,
                TestHelper.mockedProtocolTunnelJumpRetrievedDtoOutput.comments,
                TestHelper.mockedProtocolTunnelJumpRetrievedDtoOutput.jumpPolicyId,
                TestHelper.mockedProtocolTunnelJumpRetrievedDtoOutput.sessionPolicyId,
                TestHelper.mockedProtocolTunnelJumpRetrievedDtoOutput.tunnelListenAddress,
                TestHelper.mockedProtocolTunnelJumpRetrievedDtoOutput.tunnelDefinitions,
                TestHelper.mockedProtocolTunnelJumpRetrievedDtoOutput.tunnelType,
                TestHelper.mockedProtocolTunnelJumpRetrievedDtoOutput.username,
                TestHelper.mockedProtocolTunnelJumpRetrievedDtoOutput.database,
                TestHelper.mockedProtocolTunnelJumpRetrievedDtoOutput.url,
                TestHelper.mockedProtocolTunnelJumpRetrievedDtoOutput.caCertificates,
            );
            expect(protocolTunnelJumpRepositoryServiceCreateMethod).toHaveBeenCalledWith(
                123,
                protocolTunnelJumpEntityToBeCreated,
            );
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining(<ProtocolTunnelJumpCopiedEvent>{
                    transactionId: 'transaction-1',
                    eventType: ProtocolTunnelJumpCopiedEvent.EVENT_TYPE,
                    payload: {
                        protocolTunnelJump: result,
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
                handler.execute(<CopyProtocolTunnelJumpCommand>{
                    transactionId: 'transaction-1',
                    name: 'protocol-tunnel-jump-1',
                }),
            ).rejects.toThrow('Error');
            expect(commandBusExecuteMethod).toHaveBeenCalled();
        });

        it('should throw an error and publish an event if the repository service fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const protocolTunnelJumpEntityToBeCreated = {
                name: 'protocol-tunnel-jump-1',
                id: 123,
            } as ProtocolTunnelJumpEntity;
            const protocolTunnelJumpEntityCreateMethod = jest
                .spyOn(ProtocolTunnelJumpEntity, 'create')
                .mockReturnValue(protocolTunnelJumpEntityToBeCreated);
            const expectedError = new Error('Error');
            const protocolTunnelJumpRepositoryServiceCreateMethod = jest
                .spyOn(protocolTunnelJumpRepositoryService, 'create')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<CopyProtocolTunnelJumpCommand>{
                    transactionId: 'transaction-1',
                    name: 'protocol-tunnel-jump-1',
                    tenantId: 123,
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(protocolTunnelJumpEntityCreateMethod).toHaveBeenCalled();
            expect(protocolTunnelJumpRepositoryServiceCreateMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: ProtocolTunnelJumpCopyFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        protocolTunnelJump: protocolTunnelJumpEntityToBeCreated,
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
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedProtocolTunnelJumpCopiedDtoOutput);

    return commandBus;
}

function mockQueryBus() {
    const queryBus = {} as QueryBus;
    queryBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedProtocolTunnelJumpRetrievedDtoOutput);

    return queryBus;
}

function mockProtocolTunnelJumpRepositoryService() {
    const protocolTunnelJumpRepositoryService = {} as ProtocolTunnelJumpRepositoryService;
    protocolTunnelJumpRepositoryService.create = jest.fn();

    return protocolTunnelJumpRepositoryService;
}
