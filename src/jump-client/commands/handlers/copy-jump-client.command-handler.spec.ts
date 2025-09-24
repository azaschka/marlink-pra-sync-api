import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { CopyJumpClientCommand as BTCopyJumpClientCommand } from '../../../beyondtrust-pra-conf-api/jump-client/commands';
import {
    JumpClientCopiedDtoOutput,
    JumpClientRetrievedDtoOutput,
} from '../../../beyondtrust-pra-conf-api/jump-client/dtos/outputs';
import {
    JumpClientConnectionType as BTJumpClientConnectionType,
    JumpClientEndpointAgreementPolicyType as BTJumpClientEndpointAgreementPolicyType,
    JumpClientGroupType as BTJumpClientGroupType,
    JumpClientInstallMode as BTJumpClientInstallMode,
    JumpClientUnavailableReasonType as BTJumpClientUnavailableReasonType,
} from '../../../beyondtrust-pra-conf-api/jump-client/enums';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpClientEndpointAgreementPolicyType, JumpClientGroupType } from '../../enums';
import { JumpClientCopiedEvent, JumpClientCopyFailedEvent } from '../../events';
import { JumpClientEntity } from '../../repositories/entities';
import { JumpClientRepositoryService } from '../../repositories/services/jump-client-repository.service';
import { CopyJumpClientCommand } from '../copy-jump-client.command';
import { CopyJumpClientCommandHandler } from './copy-jump-client.command-handler';

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
    public static get mockedJumpClientCopiedDtoOutput(): JumpClientCopiedDtoOutput {
        return {
            action: 'copy',
            success: 'success',
            destId: 1,
        };
    }

    public static get mockedJumpClientRetrievedDtoOutput(): JumpClientRetrievedDtoOutput {
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

describe('CopyJumpClientCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let queryBus: QueryBus;
    let jumpClientRepositoryService: JumpClientRepositoryService;
    let handler: CopyJumpClientCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        queryBus = mockQueryBus();
        jumpClientRepositoryService = mockJumpClientRepositoryService();
        handler = new CopyJumpClientCommandHandler(commandBus, eventBus, queryBus, jumpClientRepositoryService);
    });

    describe('execute', () => {
        it('should call the command bus and repository service with correct parameters, publish an event and return the result', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

            const jumpClientEntityToBeCreated = { id: 123 } as JumpClientEntity;
            const jumpClientEntityCreateMethod = jest
                .spyOn(JumpClientEntity, 'create')
                .mockReturnValue(jumpClientEntityToBeCreated);

            const expectedResult = { id: 321 } as JumpClientEntity;
            const jumpClientRepositoryServiceCreateMethod = jest
                .spyOn(jumpClientRepositoryService, 'create')
                .mockResolvedValue(expectedResult);

            // Act
            const result = await handler.execute(<CopyJumpClientCommand>{
                transactionId: 'transaction-1',
                tenantId: 123,
                id: 1,
                jumpGroupId: 3,
                jumpGroupType: JumpClientGroupType.Personal,
                name: 'jump-client-1',
            });

            // Assert
            expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                new BTCopyJumpClientCommand('transaction-1', 1, 3, JumpClientGroupType.Personal, 'jump-client-1'),
            );
            expect(jumpClientEntityCreateMethod).toHaveBeenCalledWith(
                TestHelper.mockedJumpClientRetrievedDtoOutput.id,
                TestHelper.mockedJumpClientRetrievedDtoOutput.jumpGroupId,
                TestHelper.mockedJumpClientRetrievedDtoOutput.jumpGroupType,
                TestHelper.mockedJumpClientRetrievedDtoOutput.name,
                TestHelper.mockedJumpClientRetrievedDtoOutput.hostname,
                TestHelper.mockedJumpClientRetrievedDtoOutput.fqdn,
                TestHelper.mockedJumpClientRetrievedDtoOutput.tag,
                TestHelper.mockedJumpClientRetrievedDtoOutput.comments,
                TestHelper.mockedJumpClientRetrievedDtoOutput.jumpPolicyId,
                TestHelper.mockedJumpClientRetrievedDtoOutput.sessionPolicyId,
                TestHelper.mockedJumpClientRetrievedDtoOutput.installMode,
                TestHelper.mockedJumpClientRetrievedDtoOutput.connectionType,
                TestHelper.mockedJumpClientRetrievedDtoOutput.lastConnectTimestamp,
                TestHelper.mockedJumpClientRetrievedDtoOutput.lastDisconnectTimestamp,
                TestHelper.mockedJumpClientRetrievedDtoOutput.isLost,
                TestHelper.mockedJumpClientRetrievedDtoOutput.needsUpdate,
                TestHelper.mockedJumpClientRetrievedDtoOutput.unavailableReason,
                TestHelper.mockedJumpClientRetrievedDtoOutput.operatingSystem,
                TestHelper.mockedJumpClientRetrievedDtoOutput.publicIp,
                TestHelper.mockedJumpClientRetrievedDtoOutput.privateIp,
                TestHelper.mockedJumpClientRetrievedDtoOutput.consoleUser,
                TestHelper.mockedJumpClientRetrievedDtoOutput.expirationTimestamp,
                TestHelper.mockedJumpClientRetrievedDtoOutput.maxOfflineMinutes,
                TestHelper.mockedJumpClientRetrievedDtoOutput.lastAccessTimestamp,
                TestHelper.mockedJumpClientRetrievedDtoOutput.endpointAgreementPolicy,
                TestHelper.mockedJumpClientRetrievedDtoOutput.jumpointProxy,
            );
            expect(jumpClientRepositoryServiceCreateMethod).toHaveBeenCalledWith(123, jumpClientEntityToBeCreated);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining(<JumpClientCopiedEvent>{
                    transactionId: 'transaction-1',
                    eventType: JumpClientCopiedEvent.EVENT_TYPE,
                    payload: {
                        jumpClient: result,
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
                handler.execute(<CopyJumpClientCommand>{
                    transactionId: 'transaction-1',
                    name: 'jump-client-1',
                }),
            ).rejects.toThrow('Error');
            expect(commandBusExecuteMethod).toHaveBeenCalled();
        });

        it('should throw an error and publish an event if the repository service fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const jumpClientEntityToBeCreated = { name: 'jump-client-1', id: 123 } as JumpClientEntity;
            const jumpClientEntityCreateMethod = jest
                .spyOn(JumpClientEntity, 'create')
                .mockReturnValue(jumpClientEntityToBeCreated);
            const expectedError = new Error('Error');
            const jumpClientRepositoryServiceCreateMethod = jest
                .spyOn(jumpClientRepositoryService, 'create')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<CopyJumpClientCommand>{
                    transactionId: 'transaction-1',
                    name: 'jump-client-1',
                    tenantId: 123,
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(jumpClientEntityCreateMethod).toHaveBeenCalled();
            expect(jumpClientRepositoryServiceCreateMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: JumpClientCopyFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        jumpClient: jumpClientEntityToBeCreated,
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
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedJumpClientCopiedDtoOutput);

    return commandBus;
}

function mockQueryBus() {
    const queryBus = {} as QueryBus;
    queryBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedJumpClientRetrievedDtoOutput);

    return queryBus;
}

function mockJumpClientRepositoryService() {
    const jumpClientRepositoryService = {} as JumpClientRepositoryService;
    jumpClientRepositoryService.create = jest.fn();

    return jumpClientRepositoryService;
}
