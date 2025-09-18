import { ConflictException } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { CreateProtocolTunnelJumpCommand as BTCreateProtocolTunnelJumpCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/protocol-tunnel-jump/commands';
import { ProtocolTunnelJumpCreatedDtoOutput } from '../../../../beyondtrust-pra-conf-api/jump-item/protocol-tunnel-jump/dtos/outputs';
import {
    JumpGroupType as BTJumpGroupType,
    TunnelType as BTTunnelType,
} from '../../../../beyondtrust-pra-conf-api/jump-item/protocol-tunnel-jump/enums';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { JumpGroupType, TunnelType } from '../../enums';
import { ProtocolTunnelJumpCreatedEvent, ProtocolTunnelJumpCreationFailedEvent } from '../../events';
import { ProtocolTunnelJumpEntity } from '../../repositories/entities';
import { ProtocolTunnelJumpRepositoryService } from '../../repositories/services/protocol-tunnel-jump-repository.service';
import { CreateProtocolTunnelJumpCommand } from '../create-protocol-tunnel-jump.command';
import { CreateProtocolTunnelJumpCommandHandler } from './create-protocol-tunnel-jump.command-handler';

// Mock mapper function to return original/input value
jest.mock('../../mappers', () => ({
    mapFromBTJumpGroupType: jest.fn().mockImplementation((type: BTJumpGroupType) => type),
    mapToBTJumpGroupType: jest.fn().mockImplementation((type: JumpGroupType) => type),
    mapFromBTTunnelType: jest.fn().mockImplementation((type: BTTunnelType) => type),
    mapToBTTunnelType: jest.fn().mockImplementation((type: TunnelType) => type),
}));

abstract class TestHelper {
    public static get mockedProtocolTunnelJumpCreatedDtoOutput(): ProtocolTunnelJumpCreatedDtoOutput {
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

describe('CreateProtocolTunnelJumpCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let protocolTunnelJumpRepositoryService: ProtocolTunnelJumpRepositoryService;
    let handler: CreateProtocolTunnelJumpCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        protocolTunnelJumpRepositoryService = mockProtocolTunnelJumpRepositoryService();
        handler = new CreateProtocolTunnelJumpCommandHandler(commandBus, eventBus, protocolTunnelJumpRepositoryService);
    });

    describe('execute', () => {
        it('should throw a ConflictException if a Protocol Tunnel Jump with the same name, jump group id and tag already exists', async () => {
            // Arrange
            const command = <CreateProtocolTunnelJumpCommand>{
                transactionId: 'transaction-1',
                tenantId: 123,
                name: 'protocol-tunnel-jump-1',
                jumpointId: 2,
                hostname: 'hostname-1',
                jumpGroupId: 3,
                jumpGroupType: JumpGroupType.Personal,
                tag: 'tag-1',
            };
            jest.spyOn(protocolTunnelJumpRepositoryService, 'findOneBy').mockResolvedValue({
                id: 123,
            } as ProtocolTunnelJumpEntity);

            // Act & Assert
            await expect(handler.execute(command)).rejects.toThrow(ConflictException);
        });

        it.each([
            <CreateProtocolTunnelJumpCommand>{
                transactionId: 'transaction-1',
                tenantId: 123,
                name: 'protocol-tunnel-jump-1',
                jumpointId: 1,
                hostname: 'hostname-1',
                jumpGroupId: 2,
                jumpGroupType: JumpGroupType.Personal,
                tag: 'tag-1',
                comments: 'comments-1',
                jumpPolicyId: 3,
                sessionPolicyId: 4,
                tunnelListenAddress: 'tunnel-listen-address-1',
                tunnelDefinitions: 'tunnel-definitions-1',
                tunnelType: TunnelType.Mssql,
                username: 'username-1',
                database: 'database-1',
                url: 'url-1',
                caCertificates: 'ca-certificates-1',
            },
            <CreateProtocolTunnelJumpCommand>{
                transactionId: 'transaction-2',
                tenantId: 123,
                name: 'protocol-tunnel-jump-2',
                jumpointId: 2,
                hostname: 'hostname-2',
                jumpGroupId: 3,
            },
        ])(
            'should call the command bus and repository service with correct parameters, publish an event and return the result',
            async (command) => {
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
                const result = await handler.execute(command);

                // Assert
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTCreateProtocolTunnelJumpCommand(
                        command.transactionId,
                        command.name,
                        command.jumpointId,
                        command.hostname,
                        command.jumpGroupId,
                        command.jumpGroupType,
                        command.tag,
                        command.comments,
                        command.jumpPolicyId,
                        command.sessionPolicyId,
                        command.tunnelListenAddress,
                        command.tunnelDefinitions,
                        command.tunnelType,
                        command.username,
                        command.database,
                        command.url,
                        command.caCertificates,
                    ),
                );
                expect(protocolTunnelJumpEntityCreateMethod).toHaveBeenCalledWith(
                    TestHelper.mockedProtocolTunnelJumpCreatedDtoOutput.id,
                    TestHelper.mockedProtocolTunnelJumpCreatedDtoOutput.name,
                    TestHelper.mockedProtocolTunnelJumpCreatedDtoOutput.jumpointId,
                    TestHelper.mockedProtocolTunnelJumpCreatedDtoOutput.hostname,
                    TestHelper.mockedProtocolTunnelJumpCreatedDtoOutput.jumpGroupId,
                    TestHelper.mockedProtocolTunnelJumpCreatedDtoOutput.jumpGroupType,
                    TestHelper.mockedProtocolTunnelJumpCreatedDtoOutput.tag,
                    TestHelper.mockedProtocolTunnelJumpCreatedDtoOutput.comments,
                    TestHelper.mockedProtocolTunnelJumpCreatedDtoOutput.jumpPolicyId,
                    TestHelper.mockedProtocolTunnelJumpCreatedDtoOutput.sessionPolicyId,
                    TestHelper.mockedProtocolTunnelJumpCreatedDtoOutput.tunnelListenAddress,
                    TestHelper.mockedProtocolTunnelJumpCreatedDtoOutput.tunnelDefinitions,
                    TestHelper.mockedProtocolTunnelJumpCreatedDtoOutput.tunnelType,
                    TestHelper.mockedProtocolTunnelJumpCreatedDtoOutput.username,
                    TestHelper.mockedProtocolTunnelJumpCreatedDtoOutput.database,
                    TestHelper.mockedProtocolTunnelJumpCreatedDtoOutput.url,
                    TestHelper.mockedProtocolTunnelJumpCreatedDtoOutput.caCertificates,
                );
                expect(protocolTunnelJumpRepositoryServiceCreateMethod).toHaveBeenCalledWith(
                    123,
                    protocolTunnelJumpEntityToBeCreated,
                );
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<ProtocolTunnelJumpCreatedEvent>{
                        transactionId: command.transactionId,
                        eventType: ProtocolTunnelJumpCreatedEvent.EVENT_TYPE,
                        payload: {
                            protocolTunnelJump: result,
                        },
                    }),
                );
                expect(result).toBe(expectedResult);
            },
        );

        it('should throw an error if the command bus fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute').mockRejectedValue(new Error('Error'));

            // Act & Assert
            await expect(
                handler.execute(<CreateProtocolTunnelJumpCommand>{
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
                handler.execute(<CreateProtocolTunnelJumpCommand>{
                    transactionId: 'transaction-1',
                    name: 'protocol-tunnel-jump-1',
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(protocolTunnelJumpEntityCreateMethod).toHaveBeenCalled();
            expect(protocolTunnelJumpRepositoryServiceCreateMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: ProtocolTunnelJumpCreationFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        protocolTunnelJump: protocolTunnelJumpEntityToBeCreated,
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
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedProtocolTunnelJumpCreatedDtoOutput);

    return commandBus;
}

function mockProtocolTunnelJumpRepositoryService() {
    const protocolTunnelJumpRepositoryService = {} as ProtocolTunnelJumpRepositoryService;
    protocolTunnelJumpRepositoryService.create = jest.fn();
    protocolTunnelJumpRepositoryService.findOneBy = jest.fn().mockResolvedValue(null);

    return protocolTunnelJumpRepositoryService;
}
