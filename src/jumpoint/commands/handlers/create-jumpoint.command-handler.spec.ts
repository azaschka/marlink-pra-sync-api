import { CommandBus, EventBus } from '@nestjs/cqrs';
import { CreateJumpointCommand as BTCreateJumpointCommand } from '../../../beyondtrust-pra-conf-api/jumpoint/commands';
import { JumpointCreatedDtoOutput } from '../../../beyondtrust-pra-conf-api/jumpoint/dtos/outputs';
import {
    JumpointPlatformType as BTJumpointPlatformType,
    JzpClientAddressRestrictionsType as BTJzpClientAddressRestrictionsType,
} from '../../../beyondtrust-pra-conf-api/jumpoint/enums';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpointPlatformType, JzpClientAddressRestrictionsType } from '../../enums';
import { JumpointCreatedEvent, JumpointCreationFailedEvent } from '../../events';
import { JumpointEntity } from '../../repositories/entities';
import { JumpointRepositoryService } from '../../repositories/services/jumpoint-repository.service';
import { CreateJumpointCommand } from '../create-jumpoint.command';
import { CreateJumpointCommandHandler } from './create-jumpoint.command-handler';

// Mock mapper function to return original/input value
jest.mock('../../mappers', () => ({
    mapFromBTJzpClientAddressRestrictionsType: jest
        .fn()
        .mockImplementation((type: BTJzpClientAddressRestrictionsType) => type),
    mapToBTJzpClientAddressRestrictionsType: jest
        .fn()
        .mockImplementation((type: JzpClientAddressRestrictionsType) => type),
    mapFromBTJumpointPlatformType: jest.fn().mockImplementation((type: BTJzpClientAddressRestrictionsType) => type),
    mapToBTJumpointPlatformType: jest.fn().mockImplementation((type: JumpointPlatformType) => type),
}));

abstract class TestHelper {
    public static get mockedJumpointCreatedDtoOutput(): JumpointCreatedDtoOutput {
        return {
            id: 1,
            name: 'Jumpoint 1',
            platform: BTJumpointPlatformType.LinuxX86,
            codeName: 'J1',
            comments: 'Test Jumpoint 1',
            enabled: true,
            connected: true,
            clustered: false,
            shellJumpEnabled: true,
            externalJumpItemNetworkId: 'ext-1',
            protocolTunnelEnabled: true,
            rdpServiceAccountId: 1,
            managedIpRanges: [{ start: '192.168.1.0', end: '192.168.1.255' }],
            jzpEnabled: true,
            jzpProxyHostname: 'proxy.example.com',
            jzpProxyPort: 8080,
            jzpAllowHttpGet: true,
            jzpClientAddressRestrictionsType: BTJzpClientAddressRestrictionsType.AllowAll,
            jzpRestrictedIps: ['192.168.1.100'],
            dockerDeployKey: 'docker-key',
            keyInfo: 'key-info',
        };
    }
}

describe('CreateJumpointCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let jumpointRepositoryService: JumpointRepositoryService;
    let handler: CreateJumpointCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        jumpointRepositoryService = mockJumpointRepositoryService();
        handler = new CreateJumpointCommandHandler(commandBus, eventBus, jumpointRepositoryService);
    });

    describe('execute', () => {
        it.each([
            <CreateJumpointCommand>{
                transactionId: 'transaction-1',
                tenantId: 123,
                name: 'Jumpoint 1',
                platformType: JumpointPlatformType.LinuxX86,
                codeName: 'J1',
                comments: 'Test Jumpoint 1',
                isEnabled: true,
                isClustered: false,
                isShellJumpEnabled: true,
                externalJumpItemNetworkId: 'ext-1',
                isProtocolTunnelEnabled: true,
                rdpServiceAccountId: 1,
                managedIpRanges: [{ start: '192.168.1.0', end: '192.168.1.255' }],
                isJzpEnabled: true,
                jzpProxyHostname: 'proxy.example.com',
                jzpProxyPort: 8080,
                isJzpHttpGetAllowed: true,
                jzpClientAddressRestrictionsType: JzpClientAddressRestrictionsType.AllowAll,
                jzpRestrictedIps: ['192.168.1.100'],
            },
            <CreateJumpointCommand>{
                transactionId: 'transaction-2',
                tenantId: 123,
                name: 'Jumpoint 1',
                platformType: JumpointPlatformType.WindowsX86,
            },
        ])(
            'should call the command bus and repository service with correct parameters, publish an event and return the result',
            async (command) => {
                // Arrange
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
                const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

                const jumpointEntityToBeCreated = { id: 123 } as JumpointEntity;
                const jumpointEntityCreateMethod = jest
                    .spyOn(JumpointEntity, 'create')
                    .mockReturnValue(jumpointEntityToBeCreated);

                const expectedResult = { id: 321 } as JumpointEntity;
                const jumpointRepositoryServiceCreateMethod = jest
                    .spyOn(jumpointRepositoryService, 'create')
                    .mockResolvedValue(expectedResult);

                // Act
                const result = await handler.execute(command);

                // Assert
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTCreateJumpointCommand(
                        command.transactionId,
                        command.name,
                        command.platformType,
                        command.codeName,
                        command.comments,
                        command.isEnabled,
                        command.isClustered,
                        command.isShellJumpEnabled,
                        command.externalJumpItemNetworkId,
                        command.isProtocolTunnelEnabled,
                        command.rdpServiceAccountId,
                        command.managedIpRanges,
                        command.isJzpEnabled,
                        command.jzpProxyHostname,
                        command.jzpProxyPort,
                        command.isJzpHttpGetAllowed,
                        command.jzpClientAddressRestrictionsType as unknown as BTJzpClientAddressRestrictionsType,
                        command.jzpRestrictedIps,
                    ),
                );
                expect(jumpointEntityCreateMethod).toHaveBeenCalledWith(
                    TestHelper.mockedJumpointCreatedDtoOutput.id,
                    TestHelper.mockedJumpointCreatedDtoOutput.name,
                    TestHelper.mockedJumpointCreatedDtoOutput.platform,
                    TestHelper.mockedJumpointCreatedDtoOutput.codeName,
                    TestHelper.mockedJumpointCreatedDtoOutput.comments,
                    TestHelper.mockedJumpointCreatedDtoOutput.enabled,
                    TestHelper.mockedJumpointCreatedDtoOutput.connected,
                    TestHelper.mockedJumpointCreatedDtoOutput.clustered,
                    TestHelper.mockedJumpointCreatedDtoOutput.shellJumpEnabled,
                    TestHelper.mockedJumpointCreatedDtoOutput.externalJumpItemNetworkId,
                    TestHelper.mockedJumpointCreatedDtoOutput.protocolTunnelEnabled,
                    TestHelper.mockedJumpointCreatedDtoOutput.rdpServiceAccountId,
                    TestHelper.mockedJumpointCreatedDtoOutput.managedIpRanges,
                    TestHelper.mockedJumpointCreatedDtoOutput.jzpEnabled,
                    TestHelper.mockedJumpointCreatedDtoOutput.jzpProxyHostname,
                    TestHelper.mockedJumpointCreatedDtoOutput.jzpProxyPort,
                    TestHelper.mockedJumpointCreatedDtoOutput.jzpAllowHttpGet,
                    TestHelper.mockedJumpointCreatedDtoOutput.jzpClientAddressRestrictionsType,
                    TestHelper.mockedJumpointCreatedDtoOutput.jzpRestrictedIps,
                    TestHelper.mockedJumpointCreatedDtoOutput.dockerDeployKey,
                    TestHelper.mockedJumpointCreatedDtoOutput.keyInfo,
                );
                expect(jumpointRepositoryServiceCreateMethod).toHaveBeenCalledWith(123, jumpointEntityToBeCreated);
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<JumpointCreatedEvent>{
                        transactionId: command.transactionId,
                        eventType: JumpointCreatedEvent.EVENT_TYPE,
                        payload: {
                            jumpoint: result,
                            tenantId: 123,
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
                handler.execute(<CreateJumpointCommand>{
                    transactionId: 'transaction-2',
                    name: 'Jumpoint 1',
                    platformType: JumpointPlatformType.WindowsX86,
                }),
            ).rejects.toThrow('Error');
            expect(commandBusExecuteMethod).toHaveBeenCalled();
        });

        it('should throw an error and publish an event if the repository service fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const jumpointEntityToBeCreated = {
                name: 'jumpoint-1',
                platformType: JumpointPlatformType.WindowsX86,
                id: 123,
            } as JumpointEntity;
            const jumpointEntityCreateMethod = jest
                .spyOn(JumpointEntity, 'create')
                .mockReturnValue(jumpointEntityToBeCreated);
            const expectedError = new Error('Error');
            const jumpointRepositoryServiceCreateMethod = jest
                .spyOn(jumpointRepositoryService, 'create')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<CreateJumpointCommand>{
                    transactionId: 'transaction-1',
                    name: 'jumpoint-1',
                    platformType: JumpointPlatformType.WindowsX86,
                    tenantId: 123,
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(jumpointEntityCreateMethod).toHaveBeenCalled();
            expect(jumpointRepositoryServiceCreateMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: JumpointCreationFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        jumpoint: jumpointEntityToBeCreated,
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
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedJumpointCreatedDtoOutput);

    return commandBus;
}

function mockJumpointRepositoryService() {
    const jumpointRepositoryService = {} as JumpointRepositoryService;
    jumpointRepositoryService.create = jest.fn();

    return jumpointRepositoryService;
}
