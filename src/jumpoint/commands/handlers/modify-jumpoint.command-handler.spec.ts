import { CommandBus, EventBus } from '@nestjs/cqrs';
import { ModifyJumpointCommand as BTModifyJumpointCommand } from '../../../beyondtrust-pra-conf-api/jumpoint/commands';
import { JumpointModifiedDtoOutput } from '../../../beyondtrust-pra-conf-api/jumpoint/dtos/outputs';
import {
    JumpointPlatformType as BTJumpointPlatformType,
    JzpClientAddressRestrictionsType as BTJzpClientAddressRestrictionsType,
} from '../../../beyondtrust-pra-conf-api/jumpoint/enums';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpointPlatformType, JzpClientAddressRestrictionsType } from '../../enums';
import { JumpointModificationFailedEvent, JumpointModifiedEvent } from '../../events';
import { JumpointEntity } from '../../repositories/entities';
import { JumpointRepositoryService } from '../../repositories/services/jumpoint-repository.service';
import { ModifyJumpointCommand } from '../modify-jumpoint.command';
import { ModifyJumpointCommandHandler } from './modify-jumpoint.command-handler';

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
    public static get mockedJumpointModifiedDtoOutput(): JumpointModifiedDtoOutput {
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

describe('ModifyJumpointCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let jumpointRepositoryService: JumpointRepositoryService;
    let handler: ModifyJumpointCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        jumpointRepositoryService = mockJumpointRepositoryService();
        handler = new ModifyJumpointCommandHandler(commandBus, eventBus, jumpointRepositoryService);
    });

    describe('execute', () => {
        it.each([
            <ModifyJumpointCommand>{
                transactionId: 'transaction-1',
                tenantId: 100,
                id: 123,
                name: 'Jumpoint 1',
                codeName: 'code-1',
                comments: 'Test Jumpoint 1',
                isEnabled: true,
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
            <ModifyJumpointCommand>{
                transactionId: 'transaction-2',
                tenantId: 100,
                id: 456,
                name: 'Jumpoint 1',
                codeName: 'code-2',
            },
        ])(
            'should call the command bus and repository service with correct parameters, publish an event and return the result',
            async (command) => {
                // Arrange
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
                const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

                const jumpointEntityToBeUpdated = { id: 123 } as JumpointEntity;
                const jumpointEntityCreateMethod = jest
                    .spyOn(JumpointEntity, 'create')
                    .mockReturnValue(jumpointEntityToBeUpdated);

                const expectedResult = { id: 321 } as JumpointEntity;
                const jumpointRepositoryServiceCreateOrUpdateByIdMethod = jest
                    .spyOn(jumpointRepositoryService, 'createOrUpdateById')
                    .mockResolvedValue(Promise.resolve());
                const jumpointRepositoryServiceFindByIdMethod = jest
                    .spyOn(jumpointRepositoryService, 'findOneById')
                    .mockResolvedValue(Promise.resolve(expectedResult));

                // Act
                const result = await handler.execute(command);

                // Assert
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTModifyJumpointCommand(
                        command.transactionId,
                        command.tenantId,
                        command.id,
                        command.name,
                        command.codeName,
                        command.comments,
                        command.isEnabled,
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
                    TestHelper.mockedJumpointModifiedDtoOutput.id,
                    TestHelper.mockedJumpointModifiedDtoOutput.name,
                    TestHelper.mockedJumpointModifiedDtoOutput.platform,
                    TestHelper.mockedJumpointModifiedDtoOutput.codeName,
                    TestHelper.mockedJumpointModifiedDtoOutput.comments,
                    TestHelper.mockedJumpointModifiedDtoOutput.enabled,
                    TestHelper.mockedJumpointModifiedDtoOutput.connected,
                    TestHelper.mockedJumpointModifiedDtoOutput.clustered,
                    TestHelper.mockedJumpointModifiedDtoOutput.shellJumpEnabled,
                    TestHelper.mockedJumpointModifiedDtoOutput.externalJumpItemNetworkId,
                    TestHelper.mockedJumpointModifiedDtoOutput.protocolTunnelEnabled,
                    TestHelper.mockedJumpointModifiedDtoOutput.rdpServiceAccountId,
                    TestHelper.mockedJumpointModifiedDtoOutput.managedIpRanges,
                    TestHelper.mockedJumpointModifiedDtoOutput.jzpEnabled,
                    TestHelper.mockedJumpointModifiedDtoOutput.jzpProxyHostname,
                    TestHelper.mockedJumpointModifiedDtoOutput.jzpProxyPort,
                    TestHelper.mockedJumpointModifiedDtoOutput.jzpAllowHttpGet,
                    TestHelper.mockedJumpointModifiedDtoOutput.jzpClientAddressRestrictionsType,
                    TestHelper.mockedJumpointModifiedDtoOutput.jzpRestrictedIps,
                    TestHelper.mockedJumpointModifiedDtoOutput.dockerDeployKey,
                    TestHelper.mockedJumpointModifiedDtoOutput.keyInfo,
                );
                expect(jumpointRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalledWith(
                    100,
                    jumpointEntityToBeUpdated,
                );
                expect(jumpointRepositoryServiceFindByIdMethod).toHaveBeenCalledWith(100, jumpointEntityToBeUpdated.id);
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<JumpointModifiedEvent>{
                        transactionId: command.transactionId,
                        eventType: JumpointModifiedEvent.EVENT_TYPE,
                        payload: {
                            jumpoint: result,
                            tenantId: 100,
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
                handler.execute(<ModifyJumpointCommand>{
                    transactionId: 'transaction-2',
                    name: 'Jumpoint 1',
                }),
            ).rejects.toThrow('Error');
            expect(commandBusExecuteMethod).toHaveBeenCalled();
        });

        it('should throw an error if the jumpoint retrieval from repository returns null', async () => {
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
            const jumpointRepositoryServiceCreateOrUpdateByIdMethod = jest.spyOn(
                jumpointRepositoryService,
                'createOrUpdateById',
            );
            const jumpointRepositoryServiceFindByIdMethod = jest
                .spyOn(jumpointRepositoryService, 'findOneById')
                .mockResolvedValue(null);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<ModifyJumpointCommand>{
                    transactionId: 'transaction-1',
                    name: 'jumpoint-1',
                    tenantId: 123,
                }),
            ).rejects.toThrow();
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(jumpointEntityCreateMethod).toHaveBeenCalled();
            expect(jumpointRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalled();
            expect(jumpointRepositoryServiceFindByIdMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalled();
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: JumpointModificationFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        jumpoint: jumpointEntityToBeCreated,
                        tenantId: 123,
                    },
                }),
            );
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
            const jumpointRepositoryServiceCreateOrUpdateByIdMethod = jest
                .spyOn(jumpointRepositoryService, 'createOrUpdateById')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<ModifyJumpointCommand>{
                    transactionId: 'transaction-1',
                    name: 'jumpoint-1',
                    tenantId: 123,
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(jumpointEntityCreateMethod).toHaveBeenCalled();
            expect(jumpointRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: JumpointModificationFailedEvent.EVENT_TYPE,
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
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedJumpointModifiedDtoOutput);

    return commandBus;
}

function mockJumpointRepositoryService() {
    const jumpointRepositoryService = {} as JumpointRepositoryService;
    jumpointRepositoryService.createOrUpdateById = jest.fn();
    jumpointRepositoryService.findOneById = jest.fn();

    return jumpointRepositoryService;
}
