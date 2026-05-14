import { HttpException, HttpStatus } from '@nestjs/common';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { CreateJumpointCommand as BTCreateJumpointCommand } from '../../../beyondtrust-pra-conf-api/jumpoint/commands';
import {
    JumpointCreatedDtoOutput,
    JumpointRetrievedDtoOutput,
} from '../../../beyondtrust-pra-conf-api/jumpoint/dtos/outputs';
import {
    JumpointPlatformType as BTJumpointPlatformType,
    JzpClientAddressRestrictionsType as BTJzpClientAddressRestrictionsType,
} from '../../../beyondtrust-pra-conf-api/jumpoint/enums';
import { RetrieveJumpointsQuery as BTRetrieveJumpointsQuery } from '../../../beyondtrust-pra-conf-api/jumpoint/queries';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpointPlatformType, JzpClientAddressRestrictionsType } from '../../enums';
import { JumpointCreatedEvent, JumpointCreationFailedEvent } from '../../events';
import { JumpointEntity } from '../../repositories/entities';
import { JumpointRepositoryService } from '../../repositories/services/jumpoint-repository.service';
import { CreateJumpointCommand } from '../create-jumpoint.command';
import { CreateJumpointCommandHandler } from './create-jumpoint.command-handler';

/* eslint-disable @typescript-eslint/unbound-method */

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

    public static get mockedJumpointRetrievedDtoOutput(): JumpointRetrievedDtoOutput {
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
    let queryBus: QueryBus;
    let eventBus: EventBus;
    let jumpointRepositoryService: JumpointRepositoryService;
    let handler: CreateJumpointCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        queryBus = mockQueryBus();
        eventBus = mockEventBus();
        jumpointRepositoryService = mockJumpointRepositoryService();
        handler = new CreateJumpointCommandHandler(commandBus, queryBus, eventBus, jumpointRepositoryService);
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

                jest.spyOn(commandBus, 'execute');

                jest.spyOn(eventBus, 'publish');

                const jumpointEntityToBeCreated = { id: 123 } as JumpointEntity;

                jest.spyOn(JumpointEntity, 'create').mockReturnValue(jumpointEntityToBeCreated);

                const expectedResult = { id: 321 } as JumpointEntity;

                jest.spyOn(jumpointRepositoryService, 'create').mockResolvedValue(expectedResult);

                // Act
                const result = await handler.execute(command);

                // Assert
                expect(commandBus.execute).toHaveBeenCalledWith(
                    new BTCreateJumpointCommand(
                        command.transactionId,
                        command.tenantId,
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
                expect(JumpointEntity.create).toHaveBeenCalledWith(
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
                expect(jumpointRepositoryService.create).toHaveBeenCalledWith(123, jumpointEntityToBeCreated);
                expect(eventBus.publish).toHaveBeenCalledWith(
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

        it('should throw an error if the command bus fails with a non-422 error', async () => {
            // Arrange
            jest.spyOn(commandBus, 'execute').mockRejectedValue(new Error('Error'));

            // Act & Assert
            await expect(
                handler.execute(<CreateJumpointCommand>{
                    transactionId: 'transaction-2',
                    name: 'Jumpoint 1',
                    platformType: JumpointPlatformType.WindowsX86,
                }),
            ).rejects.toThrow('Error');
            expect(commandBus.execute).toHaveBeenCalled();
        });

        it('should throw an error and publish an event if the repository service fails', async () => {
            // Arrange

            jest.spyOn(commandBus, 'execute');
            const jumpointEntityToBeCreated = {
                name: 'jumpoint-1',
                platformType: JumpointPlatformType.WindowsX86,
                id: 123,
            } as JumpointEntity;

            jest.spyOn(JumpointEntity, 'create').mockReturnValue(jumpointEntityToBeCreated);
            const expectedError = new Error('Error');

            jest.spyOn(jumpointRepositoryService, 'create').mockRejectedValue(expectedError);

            jest.spyOn(eventBus, 'publish');

            jest.spyOn(ErrorProcessorUtility, 'stringify').mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<CreateJumpointCommand>{
                    transactionId: 'transaction-1',
                    name: 'jumpoint-1',
                    platformType: JumpointPlatformType.WindowsX86,
                    tenantId: 123,
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBus.execute).toHaveBeenCalled();
            expect(JumpointEntity.create).toHaveBeenCalled();
            expect(jumpointRepositoryService.create).toHaveBeenCalled();
            expect(ErrorProcessorUtility.stringify).toHaveBeenCalledWith(expectedError);
            expect(eventBus.publish).toHaveBeenCalledWith(
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

        it('should fetch existing jumpoint from BeyondTrust and upsert to local DB when BT returns 422 name-already-taken', async () => {
            // Arrange
            const command = <CreateJumpointCommand>{
                transactionId: 'transaction-1',
                tenantId: 123,
                name: 'Jumpoint 1',
                platformType: JumpointPlatformType.LinuxX86,
            };

            const alreadyTakenError = new HttpException({}, HttpStatus.UNPROCESSABLE_ENTITY);

            jest.spyOn(commandBus, 'execute').mockRejectedValue(alreadyTakenError);

            const existingBTJumpoint = TestHelper.mockedJumpointRetrievedDtoOutput;

            jest.spyOn(queryBus, 'execute').mockResolvedValue([existingBTJumpoint]);

            const jumpointEntityToBeCreated = { id: 1, name: 'Jumpoint 1' } as JumpointEntity;

            jest.spyOn(JumpointEntity, 'create').mockReturnValue(jumpointEntityToBeCreated);

            jest.spyOn(jumpointRepositoryService, 'createOrUpdateById').mockResolvedValue(undefined);

            jest.spyOn(eventBus, 'publish');

            // Act
            const result = await handler.execute(command);

            // Assert
            expect(queryBus.execute).toHaveBeenCalledWith(
                new BTRetrieveJumpointsQuery(
                    command.transactionId,
                    command.tenantId,
                    1,
                    1,
                    command.name,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                ),
            );
            expect(jumpointRepositoryService.createOrUpdateById).toHaveBeenCalledWith(
                command.tenantId,
                jumpointEntityToBeCreated,
            );
            expect(jumpointRepositoryService.create).not.toHaveBeenCalled();
            expect(eventBus.publish).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: command.transactionId,
                    eventType: JumpointCreatedEvent.EVENT_TYPE,
                    payload: {
                        jumpoint: jumpointEntityToBeCreated,
                        tenantId: command.tenantId,
                    },
                }),
            );
            expect(result).toBe(jumpointEntityToBeCreated);
        });

        it('should rethrow 422 error if jumpoint cannot be found in BeyondTrust after name-already-taken', async () => {
            // Arrange
            const command = <CreateJumpointCommand>{
                transactionId: 'transaction-1',
                tenantId: 123,
                name: 'Jumpoint 1',
                platformType: JumpointPlatformType.LinuxX86,
            };

            const alreadyTakenError = new HttpException({}, HttpStatus.UNPROCESSABLE_ENTITY);
            jest.spyOn(commandBus, 'execute').mockRejectedValue(alreadyTakenError);
            jest.spyOn(queryBus, 'execute').mockResolvedValue([]);

            // Act & Assert
            await expect(handler.execute(command)).rejects.toThrow(alreadyTakenError);
            expect(queryBus.execute).toHaveBeenCalledWith(
                new BTRetrieveJumpointsQuery(
                    command.transactionId,
                    command.tenantId,
                    1,
                    1,
                    command.name,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                ),
            );
            expect(jumpointRepositoryService.createOrUpdateById).not.toHaveBeenCalled();
            expect(jumpointRepositoryService.create).not.toHaveBeenCalled();
            expect(eventBus.publish).not.toHaveBeenCalled();
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

function mockQueryBus() {
    const queryBus = {} as QueryBus;
    queryBus.execute = jest.fn().mockResolvedValue([]);

    return queryBus;
}

function mockJumpointRepositoryService() {
    const jumpointRepositoryService = {} as JumpointRepositoryService;
    jumpointRepositoryService.create = jest.fn();
    jumpointRepositoryService.createOrUpdateById = jest.fn().mockResolvedValue(undefined);

    return jumpointRepositoryService;
}
/* eslint-enable @typescript-eslint/unbound-method */
