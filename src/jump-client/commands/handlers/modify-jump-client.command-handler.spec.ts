import { CommandBus, EventBus } from '@nestjs/cqrs';
import { ModifyJumpClientCommand as BTModifyJumpClientCommand } from '../../../beyondtrust-pra-conf-api/jump-client/commands';
import { JumpClientModifiedDtoOutput } from '../../../beyondtrust-pra-conf-api/jump-client/dtos/outputs';
import {
    JumpClientConnectionType as BTJumpClientConnectionType,
    JumpClientEndpointAgreementPolicyType as BTJumpClientEndpointAgreementPolicyType,
    JumpClientGroupType as BTJumpClientGroupType,
    JumpClientInstallMode as BTJumpClientInstallMode,
    JumpClientUnavailableReasonType as BTJumpClientUnavailableReasonType,
} from '../../../beyondtrust-pra-conf-api/jump-client/enums';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpClientEndpointAgreementPolicyType, JumpClientGroupType } from '../../enums';
import { JumpClientModificationFailedEvent, JumpClientModifiedEvent } from '../../events';
import { JumpClientEntity } from '../../repositories/entities';
import { JumpClientRepositoryService } from '../../repositories/services/jump-client-repository.service';
import { ModifyJumpClientCommand } from '../modify-jump-client.command';
import { ModifyJumpClientCommandHandler } from './modify-jump-client.command-handler';

// Mock mapper function to return original/input value
jest.mock('../../mappers', () => ({
    mapFromBTJumpClientConnectionType: jest.fn().mockImplementation((type: BTJumpClientConnectionType) => type),
    mapFromBTJumpClientEndpointAgreementPolicyType: jest
        .fn()
        .mockImplementation((type: BTJumpClientEndpointAgreementPolicyType) => type),
    mapFromBTJumpClientGroupType: jest.fn().mockImplementation((type: BTJumpClientGroupType) => type),
    mapFromBTJumpClientInstallMode: jest.fn().mockImplementation((type: BTJumpClientInstallMode) => type),
    mapFromBTJumpClientUnavailableReasonType: jest
        .fn()
        .mockImplementation((type: BTJumpClientUnavailableReasonType) => type),
    mapToBTJumpClientEndpointAgreementPolicyType: jest
        .fn()
        .mockImplementation((type: JumpClientEndpointAgreementPolicyType) => type),
    mapToBTJumpClientGroupType: jest.fn().mockImplementation((type: JumpClientGroupType) => type),
}));

abstract class TestHelper {
    public static get mockedJumpClientModifiedDtoOutput(): JumpClientModifiedDtoOutput {
        return {
            jumpGroupId: 123,
            id: 1,
            jumpGroupType: JumpClientGroupType.Personal,
            name: 'client-1',
            hostname: 'host-1',
            fqdn: 'fqdn-1',
            tag: 'tag-1',
            comments: 'comments-1',
            jumpPolicyId: 456,
            sessionPolicyId: 789,
            installMode: BTJumpClientInstallMode.Unknown,
            connectionType: BTJumpClientConnectionType.Uninstalled,
            lastConnectTimestamp: new Date('2025-10-01T00:00:00Z'),
            lastDisconnectTimestamp: new Date('2025-10-02T00:00:00Z'),
            isLost: false,
            needsUpdate: true,
            unavailableReason: BTJumpClientUnavailableReasonType.None,
            operatingSystem: 'Windows',
            publicIp: 'public-ip-1',
            privateIp: 'private-ip-1',
            consoleUser: 'console-1',
            expirationTimestamp: new Date('2025-10-03T00:00:00Z'),
            maxOfflineMinutes: 0,
            lastAccessTimestamp: new Date('2025-10-04T00:00:00Z'),
            endpointAgreementPolicy: BTJumpClientEndpointAgreementPolicyType.NoPrompt,
            jumpointProxy: 'proxy-1',
        };
    }
}

describe('ModifyJumpClientCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let jumpClientRepositoryService: JumpClientRepositoryService;
    let handler: ModifyJumpClientCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        jumpClientRepositoryService = mockJumpClientRepositoryService();
        handler = new ModifyJumpClientCommandHandler(commandBus, eventBus, jumpClientRepositoryService);
    });

    describe('execute', () => {
        it.each([
            <ModifyJumpClientCommand>{
                transactionId: 'transaction-1',
                tenantId: 100,
                id: 1,
                jumpGroupId: 123,
                jumpGroupType: JumpClientGroupType.Personal,
                name: 'name-1',
                tag: 'tag-1',
                comments: 'comments-1',
                jumpPolicyId: 456,
                sessionPolicyId: 789,
                maxOfflineDurationInMinutes: 0,
                endpointAgreementPolicyType: JumpClientEndpointAgreementPolicyType.NoPrompt,
            },
            <ModifyJumpClientCommand>{
                transactionId: 'transaction-2',
                tenantId: 100,
                id: 2,
                jumpGroupId: 123,
            },
        ])(
            'should call the command bus and repository service with correct parameters, publish an event and return the result',
            async (command) => {
                // Arrange
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
                const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

                const jumpClientEntityToBeUpdated = { id: 123 } as JumpClientEntity;
                const jumpClientEntityCreateMethod = jest
                    .spyOn(JumpClientEntity, 'create')
                    .mockReturnValue(jumpClientEntityToBeUpdated);

                const expectedResult = { id: 321 } as JumpClientEntity;
                const jumpClientRepositoryServiceCreateOrUpdateByIdMethod = jest
                    .spyOn(jumpClientRepositoryService, 'createOrUpdateById')
                    .mockResolvedValue(Promise.resolve());
                const jumpClientRepositoryServiceFindByIdMethod = jest
                    .spyOn(jumpClientRepositoryService, 'findOneById')
                    .mockResolvedValue(Promise.resolve(expectedResult));

                // Act
                const result = await handler.execute(command);

                // Assert
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTModifyJumpClientCommand(
                        command.transactionId,
                        command.tenantId,
                        command.id,
                        command.jumpGroupId,
                        command.jumpGroupType,
                        command.name,
                        command.tag,
                        command.comments,
                        command.jumpPolicyId,
                        command.sessionPolicyId,
                        command.maxOfflineDurationInMinutes,
                        command.endpointAgreementPolicyType as unknown as BTJumpClientEndpointAgreementPolicyType,
                    ),
                );
                expect(jumpClientEntityCreateMethod).toHaveBeenCalledWith(
                    TestHelper.mockedJumpClientModifiedDtoOutput.id,
                    TestHelper.mockedJumpClientModifiedDtoOutput.jumpGroupId,
                    TestHelper.mockedJumpClientModifiedDtoOutput.jumpGroupType,
                    TestHelper.mockedJumpClientModifiedDtoOutput.name,
                    TestHelper.mockedJumpClientModifiedDtoOutput.hostname,
                    TestHelper.mockedJumpClientModifiedDtoOutput.fqdn,
                    TestHelper.mockedJumpClientModifiedDtoOutput.tag,
                    TestHelper.mockedJumpClientModifiedDtoOutput.comments,
                    TestHelper.mockedJumpClientModifiedDtoOutput.jumpPolicyId,
                    TestHelper.mockedJumpClientModifiedDtoOutput.sessionPolicyId,
                    TestHelper.mockedJumpClientModifiedDtoOutput.installMode,
                    TestHelper.mockedJumpClientModifiedDtoOutput.connectionType,
                    TestHelper.mockedJumpClientModifiedDtoOutput.lastConnectTimestamp,
                    TestHelper.mockedJumpClientModifiedDtoOutput.lastDisconnectTimestamp,
                    TestHelper.mockedJumpClientModifiedDtoOutput.isLost,
                    TestHelper.mockedJumpClientModifiedDtoOutput.needsUpdate,
                    TestHelper.mockedJumpClientModifiedDtoOutput.unavailableReason,
                    TestHelper.mockedJumpClientModifiedDtoOutput.operatingSystem,
                    TestHelper.mockedJumpClientModifiedDtoOutput.publicIp,
                    TestHelper.mockedJumpClientModifiedDtoOutput.privateIp,
                    TestHelper.mockedJumpClientModifiedDtoOutput.consoleUser,
                    TestHelper.mockedJumpClientModifiedDtoOutput.expirationTimestamp,
                    TestHelper.mockedJumpClientModifiedDtoOutput.maxOfflineMinutes,
                    TestHelper.mockedJumpClientModifiedDtoOutput.lastAccessTimestamp,
                    TestHelper.mockedJumpClientModifiedDtoOutput.endpointAgreementPolicy,
                    TestHelper.mockedJumpClientModifiedDtoOutput.jumpointProxy,
                );
                expect(jumpClientRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalledWith(
                    command.tenantId,
                    jumpClientEntityToBeUpdated,
                );
                expect(jumpClientRepositoryServiceFindByIdMethod).toHaveBeenCalledWith(
                    command.tenantId,
                    jumpClientEntityToBeUpdated.id,
                );
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<JumpClientModifiedEvent>{
                        transactionId: command.transactionId,
                        eventType: JumpClientModifiedEvent.EVENT_TYPE,
                        payload: {
                            jumpClient: result,
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
                handler.execute(<ModifyJumpClientCommand>{
                    transactionId: 'transaction-1',
                    id: 123,
                }),
            ).rejects.toThrow('Error');
            expect(commandBusExecuteMethod).toHaveBeenCalled();
        });

        it('should throw an error if the user retrieval from repository returns null', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const jumpClientEntityToBeCreated = { id: 123 } as JumpClientEntity;
            const jumpClientEntityCreateMethod = jest
                .spyOn(JumpClientEntity, 'create')
                .mockReturnValue(jumpClientEntityToBeCreated);
            const jumpClientRepositoryServiceCreateOrUpdateByIdMethod = jest.spyOn(
                jumpClientRepositoryService,
                'createOrUpdateById',
            );
            const jumpClientRepositoryServiceFindByIdMethod = jest
                .spyOn(jumpClientRepositoryService, 'findOneById')
                .mockResolvedValue(null);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<ModifyJumpClientCommand>{
                    transactionId: 'transaction-1',
                    id: 123,
                    tenantId: 100,
                }),
            ).rejects.toThrow();
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(jumpClientEntityCreateMethod).toHaveBeenCalled();
            expect(jumpClientRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalled();
            expect(jumpClientRepositoryServiceFindByIdMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalled();
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: JumpClientModificationFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        jumpClient: jumpClientEntityToBeCreated,
                        tenantId: 100,
                    },
                }),
            );
        });

        it('should throw an error and publish an event if the repository service fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const jumpClientEntityToBeCreated = { id: 123 } as JumpClientEntity;
            const jumpClientEntityCreateMethod = jest
                .spyOn(JumpClientEntity, 'create')
                .mockReturnValue(jumpClientEntityToBeCreated);
            const expectedError = new Error('Error');
            const jumpClientRepositoryServiceCreateOrUpdateByIdMethod = jest
                .spyOn(jumpClientRepositoryService, 'createOrUpdateById')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<ModifyJumpClientCommand>{
                    transactionId: 'transaction-1',
                    id: 123,
                    tenantId: 100,
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(jumpClientEntityCreateMethod).toHaveBeenCalled();
            expect(jumpClientRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: JumpClientModificationFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        jumpClient: jumpClientEntityToBeCreated,
                        tenantId: 100,
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
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedJumpClientModifiedDtoOutput);

    return commandBus;
}

function mockJumpClientRepositoryService() {
    const jumpClientRepositoryService = {} as JumpClientRepositoryService;
    jumpClientRepositoryService.createOrUpdateById = jest.fn();
    jumpClientRepositoryService.findOneById = jest.fn();

    return jumpClientRepositoryService;
}
