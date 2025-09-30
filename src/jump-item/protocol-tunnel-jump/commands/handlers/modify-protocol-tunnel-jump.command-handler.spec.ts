import { CommandBus, EventBus } from '@nestjs/cqrs';
import { ModifyProtocolTunnelJumpCommand as BTModifyProtocolTunnelJumpCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/protocol-tunnel-jump/commands';
import { ProtocolTunnelJumpModifiedDtoOutput } from '../../../../beyondtrust-pra-conf-api/jump-item/protocol-tunnel-jump/dtos/outputs';
import {
    JumpGroupType as BTJumpGroupType,
    TunnelType as BTTunnelType,
} from '../../../../beyondtrust-pra-conf-api/jump-item/protocol-tunnel-jump/enums';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { JumpGroupType, TunnelType } from '../../enums';
import { ProtocolTunnelJumpModificationFailedEvent, ProtocolTunnelJumpModifiedEvent } from '../../events';
import { ProtocolTunnelJumpEntity } from '../../repositories/entities';
import { ProtocolTunnelJumpRepositoryService } from '../../repositories/services/protocol-tunnel-jump-repository.service';
import { ModifyProtocolTunnelJumpCommand } from '../modify-protocol-tunnel-jump.command';
import { ModifyProtocolTunnelJumpCommandHandler } from './modify-protocol-tunnel-jump.command-handler';

// Mock mapper function to return original/input value
jest.mock('../../mappers', () => ({
    mapFromBTJumpGroupType: jest.fn().mockImplementation((type: BTJumpGroupType) => type),
    mapToBTJumpGroupType: jest.fn().mockImplementation((type: JumpGroupType) => type),
    mapFromBTTunnelType: jest.fn().mockImplementation((type: BTTunnelType) => type),
    mapToBTTunnelType: jest.fn().mockImplementation((type: TunnelType) => type),
}));

abstract class TestHelper {
    public static get mockedProtocolTunnelJumpModifiedDtoOutput(): ProtocolTunnelJumpModifiedDtoOutput {
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

describe('ModifyProtocolTunnelJumpCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let protocolTunnelJumpRepositoryService: ProtocolTunnelJumpRepositoryService;
    let handler: ModifyProtocolTunnelJumpCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        protocolTunnelJumpRepositoryService = mockProtocolTunnelJumpRepositoryService();
        handler = new ModifyProtocolTunnelJumpCommandHandler(commandBus, eventBus, protocolTunnelJumpRepositoryService);
    });

    describe('execute', () => {
        it.each([
            <ModifyProtocolTunnelJumpCommand>{
                transactionId: 'transaction-1',
                tenantId: 123,
                id: 1,
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
            <ModifyProtocolTunnelJumpCommand>{
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

                const protocolTunnelJumpEntityToBeUpdated = { id: 123 } as ProtocolTunnelJumpEntity;
                const protocolTunnelJumpEntityCreateMethod = jest
                    .spyOn(ProtocolTunnelJumpEntity, 'create')
                    .mockReturnValue(protocolTunnelJumpEntityToBeUpdated);

                const expectedResult = { id: 321 } as ProtocolTunnelJumpEntity;
                const protocolTunnelJumpRepositoryServiceCreateOrUpdateByIdMethod = jest
                    .spyOn(protocolTunnelJumpRepositoryService, 'createOrUpdateById')
                    .mockResolvedValue(Promise.resolve());
                const protocolTunnelJumpRepositoryServiceFindByIdMethod = jest
                    .spyOn(protocolTunnelJumpRepositoryService, 'findOneById')
                    .mockResolvedValue(Promise.resolve(expectedResult));

                // Act
                const result = await handler.execute(command);

                // Assert
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTModifyProtocolTunnelJumpCommand(
                        command.transactionId,
                        command.tenantId,
                        command.id,
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
                    TestHelper.mockedProtocolTunnelJumpModifiedDtoOutput.id,
                    TestHelper.mockedProtocolTunnelJumpModifiedDtoOutput.name,
                    TestHelper.mockedProtocolTunnelJumpModifiedDtoOutput.jumpointId,
                    TestHelper.mockedProtocolTunnelJumpModifiedDtoOutput.hostname,
                    TestHelper.mockedProtocolTunnelJumpModifiedDtoOutput.jumpGroupId,
                    TestHelper.mockedProtocolTunnelJumpModifiedDtoOutput.jumpGroupType,
                    TestHelper.mockedProtocolTunnelJumpModifiedDtoOutput.tag,
                    TestHelper.mockedProtocolTunnelJumpModifiedDtoOutput.comments,
                    TestHelper.mockedProtocolTunnelJumpModifiedDtoOutput.jumpPolicyId,
                    TestHelper.mockedProtocolTunnelJumpModifiedDtoOutput.sessionPolicyId,
                    TestHelper.mockedProtocolTunnelJumpModifiedDtoOutput.tunnelListenAddress,
                    TestHelper.mockedProtocolTunnelJumpModifiedDtoOutput.tunnelDefinitions,
                    TestHelper.mockedProtocolTunnelJumpModifiedDtoOutput.tunnelType,
                    TestHelper.mockedProtocolTunnelJumpModifiedDtoOutput.username,
                    TestHelper.mockedProtocolTunnelJumpModifiedDtoOutput.database,
                    TestHelper.mockedProtocolTunnelJumpModifiedDtoOutput.url,
                    TestHelper.mockedProtocolTunnelJumpModifiedDtoOutput.caCertificates,
                );
                expect(protocolTunnelJumpRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalledWith(
                    123,
                    protocolTunnelJumpEntityToBeUpdated,
                );
                expect(protocolTunnelJumpRepositoryServiceFindByIdMethod).toHaveBeenCalledWith(
                    123,
                    protocolTunnelJumpEntityToBeUpdated.id,
                );
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<ProtocolTunnelJumpModifiedEvent>{
                        transactionId: command.transactionId,
                        eventType: ProtocolTunnelJumpModifiedEvent.EVENT_TYPE,
                        payload: {
                            protocolTunnelJump: result,
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
                handler.execute(<ModifyProtocolTunnelJumpCommand>{
                    transactionId: 'transaction-1',
                    name: 'protocol-tunnel-jump-1',
                }),
            ).rejects.toThrow('Error');
            expect(commandBusExecuteMethod).toHaveBeenCalled();
        });

        it('should throw an error if the retrieval from repository returns null', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const protocolTunnelJumpEntityToBeCreated = {
                name: 'protocol-tunnel-jump-1',
                id: 123,
            } as ProtocolTunnelJumpEntity;
            const protocolTunnelJumpEntityCreateMethod = jest
                .spyOn(ProtocolTunnelJumpEntity, 'create')
                .mockReturnValue(protocolTunnelJumpEntityToBeCreated);
            const protocolTunnelJumpRepositoryServiceCreateOrUpdateByIdMethod = jest.spyOn(
                protocolTunnelJumpRepositoryService,
                'createOrUpdateById',
            );
            const protocolTunnelJumpRepositoryServiceFindByIdMethod = jest
                .spyOn(protocolTunnelJumpRepositoryService, 'findOneById')
                .mockResolvedValue(null);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<ModifyProtocolTunnelJumpCommand>{
                    transactionId: 'transaction-1',
                    name: 'protocol-tunnel-jump-1',
                    tenantId: 123,
                }),
            ).rejects.toThrow();
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(protocolTunnelJumpEntityCreateMethod).toHaveBeenCalled();
            expect(protocolTunnelJumpRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalled();
            expect(protocolTunnelJumpRepositoryServiceFindByIdMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalled();
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: ProtocolTunnelJumpModificationFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        protocolTunnelJump: protocolTunnelJumpEntityToBeCreated,
                        tenantId: 123,
                    },
                }),
            );
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
            const protocolTunnelJumpRepositoryServiceCreateOrUpdateByIdMethod = jest
                .spyOn(protocolTunnelJumpRepositoryService, 'createOrUpdateById')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<ModifyProtocolTunnelJumpCommand>{
                    transactionId: 'transaction-1',
                    name: 'protocol-tunnel-jump-1',
                    tenantId: 123,
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(protocolTunnelJumpEntityCreateMethod).toHaveBeenCalled();
            expect(protocolTunnelJumpRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: ProtocolTunnelJumpModificationFailedEvent.EVENT_TYPE,
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
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedProtocolTunnelJumpModifiedDtoOutput);

    return commandBus;
}

function mockProtocolTunnelJumpRepositoryService() {
    const protocolTunnelJumpRepositoryService = {} as ProtocolTunnelJumpRepositoryService;
    protocolTunnelJumpRepositoryService.createOrUpdateById = jest.fn();
    protocolTunnelJumpRepositoryService.findOneById = jest.fn();

    return protocolTunnelJumpRepositoryService;
}
