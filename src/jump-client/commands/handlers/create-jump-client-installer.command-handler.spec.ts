import { ConflictException } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { CreateJumpClientInstallerCommand as BTCreateJumpClientInstallerCommand } from '../../../beyondtrust-pra-conf-api/jump-client/commands';
import { JumpClientInstallerCreatedDtoOutput } from '../../../beyondtrust-pra-conf-api/jump-client/dtos/outputs';
import {
    JumpClientConnectionType as BTJumpClientConnectionType,
    JumpClientGroupType as BTJumpClientGroupType,
} from '../../../beyondtrust-pra-conf-api/jump-client/enums';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpClientConnectionType, JumpClientGroupType } from '../../enums';
import { JumpClientInstallerCreatedEvent, JumpClientInstallerCreationFailedEvent } from '../../events';
import { JumpClientInstallerEntity } from '../../repositories/entities';
import { JumpClientInstallerRepositoryService } from '../../repositories/services/jump-client-installer-repository.service';
import { CreateJumpClientInstallerCommand } from '../create-jump-client-installer.command';
import { CreateJumpClientInstallerCommandHandler } from './create-jump-client-installer.command-handler';

// Mock mapper function to return original/input value
jest.mock('../../mappers', () => ({
    mapFromBTJumpClientConnectionType: jest.fn().mockImplementation((type: BTJumpClientConnectionType) => type),
    mapFromBTJumpClientGroupType: jest.fn().mockImplementation((type: BTJumpClientGroupType) => type),
    mapToBTJumpClientConnectionType: jest.fn().mockImplementation((type: JumpClientConnectionType) => type),
    mapToBTJumpClientGroupType: jest.fn().mockImplementation((type: JumpClientGroupType) => type),
}));

abstract class TestHelper {
    public static get mockedJumpClientInstallerCreatedDtoOutput(): JumpClientInstallerCreatedDtoOutput {
        return {
            id: 1,
            jumpGroupId: 2,
            jumpGroupType: BTJumpClientGroupType.Personal,
            name: 'jump-client-1',
            tag: 'tag-1',
            comments: 'comments-1',
            jumpPolicyId: 3,
            sessionPolicyId: 4,
        };
    }
}

describe('CreateJumpClientInstallerCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let jumpClientInstallerRepositoryService: JumpClientInstallerRepositoryService;
    let handler: CreateJumpClientInstallerCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        jumpClientInstallerRepositoryService = mockJumpClientInstallerRepositoryService();
        handler = new CreateJumpClientInstallerCommandHandler(
            commandBus,
            eventBus,
            jumpClientInstallerRepositoryService,
        );
    });

    describe('execute', () => {
        it('should throw a ConflictException if a Jump Client installer with the same name and tag already exists', async () => {
            // Arrange
            jest.spyOn(jumpClientInstallerRepositoryService, 'findOneBy').mockResolvedValue({
                id: 1,
                name: 'jump-client-1',
                tag: 'tag-1',
            } as JumpClientInstallerEntity);

            // Act & Assert
            await expect(
                handler.execute(<CreateJumpClientInstallerCommand>{
                    transactionId: 'transaction-1',
                    jumpGroupId: 1,
                    name: 'jump-client-1',
                    tag: 'tag-1',
                }),
            ).rejects.toThrow(ConflictException);
        });

        it.each([
            <CreateJumpClientInstallerCommand>{
                transactionId: 'transaction-1',
                jumpGroupId: 1,
                name: 'jump-client-1',
                jumpGroupType: JumpClientGroupType.Personal,
                jumpPolicyId: 3,
                tag: 'tag-1',
                connectionType: JumpClientConnectionType.Passive,
                sessionPolicyId: 4,
                comments: 'comments-1',
                validDurationInMinutes: 60,
                shouldElevateInstall: true,
                shouldElevatePrompt: false,
                canOverrideJumpGroup: true,
                canOverrideJumpPolicy: false,
                canOverrideName: true,
                canOverrideTag: false,
                canOverrideComments: true,
                canOverrideSessionPolicy: false,
                jumpointProxy: 'jumpoint-proxy-1',
            },
            <CreateJumpClientInstallerCommand>{
                transactionId: 'transaction-2',
                jumpGroupId: 2,
                name: 'jump-client-2',
            },
        ])(
            'should call the command bus and repository service with correct parameters, publish an event and return the result',
            async (command) => {
                // Arrange
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
                const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

                const jumpClientInstallerEntityToBeCreated = { id: 123 } as JumpClientInstallerEntity;
                const jumpClientInstallerEntityCreateMethod = jest
                    .spyOn(JumpClientInstallerEntity, 'create')
                    .mockReturnValue(jumpClientInstallerEntityToBeCreated);

                const expectedResult = { id: 321 } as JumpClientInstallerEntity;
                const jumpClientInstallerRepositoryServiceCreateMethod = jest
                    .spyOn(jumpClientInstallerRepositoryService, 'create')
                    .mockResolvedValue(expectedResult);

                // Act
                const result = await handler.execute(command);

                // Assert
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTCreateJumpClientInstallerCommand(
                        command.transactionId,
                        command.jumpGroupId,
                        command.name,
                        command.jumpGroupType,
                        command.jumpPolicyId,
                        command.tag,
                        command.connectionType,
                        command.sessionPolicyId,
                        command.comments,
                        command.validDurationInMinutes,
                        command.shouldElevateInstall,
                        command.shouldElevatePrompt,
                        command.canOverrideJumpGroup,
                        command.canOverrideJumpPolicy,
                        command.canOverrideName,
                        command.canOverrideTag,
                        command.canOverrideComments,
                        command.canOverrideSessionPolicy,
                        command.jumpointProxy,
                    ),
                );
                expect(jumpClientInstallerEntityCreateMethod).toHaveBeenCalledWith(
                    TestHelper.mockedJumpClientInstallerCreatedDtoOutput.id,
                    TestHelper.mockedJumpClientInstallerCreatedDtoOutput.jumpGroupId,
                    TestHelper.mockedJumpClientInstallerCreatedDtoOutput.jumpGroupType,
                    TestHelper.mockedJumpClientInstallerCreatedDtoOutput.name,
                    TestHelper.mockedJumpClientInstallerCreatedDtoOutput.tag,
                    TestHelper.mockedJumpClientInstallerCreatedDtoOutput.comments,
                    TestHelper.mockedJumpClientInstallerCreatedDtoOutput.jumpPolicyId,
                    TestHelper.mockedJumpClientInstallerCreatedDtoOutput.sessionPolicyId,
                    TestHelper.mockedJumpClientInstallerCreatedDtoOutput.connectionType,
                    TestHelper.mockedJumpClientInstallerCreatedDtoOutput.expirationTimestamp,
                    TestHelper.mockedJumpClientInstallerCreatedDtoOutput.maxOfflineMinutes,
                    TestHelper.mockedJumpClientInstallerCreatedDtoOutput.elevateInstall,
                    TestHelper.mockedJumpClientInstallerCreatedDtoOutput.elevatePrompt,
                    TestHelper.mockedJumpClientInstallerCreatedDtoOutput.allowOverrideJumpGroup,
                    TestHelper.mockedJumpClientInstallerCreatedDtoOutput.allowOverrideJumpPolicy,
                    TestHelper.mockedJumpClientInstallerCreatedDtoOutput.allowOverrideName,
                    TestHelper.mockedJumpClientInstallerCreatedDtoOutput.allowOverrideTag,
                    TestHelper.mockedJumpClientInstallerCreatedDtoOutput.allowOverrideComments,
                    TestHelper.mockedJumpClientInstallerCreatedDtoOutput.allowOverrideSessionPolicy,
                    TestHelper.mockedJumpClientInstallerCreatedDtoOutput.installerId,
                    TestHelper.mockedJumpClientInstallerCreatedDtoOutput.keyInfo,
                    TestHelper.mockedJumpClientInstallerCreatedDtoOutput.jumpointProxy,
                );
                expect(jumpClientInstallerRepositoryServiceCreateMethod).toHaveBeenCalledWith(
                    jumpClientInstallerEntityToBeCreated,
                );
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<JumpClientInstallerCreatedEvent>{
                        transactionId: command.transactionId,
                        eventType: JumpClientInstallerCreatedEvent.EVENT_TYPE,
                        payload: {
                            jumpClientInstaller: result,
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
                handler.execute(<CreateJumpClientInstallerCommand>{
                    transactionId: 'transaction-1',
                    jumpGroupId: 1,
                }),
            ).rejects.toThrow('Error');
            expect(commandBusExecuteMethod).toHaveBeenCalled();
        });

        it('should throw an error and publish an event if the repository service fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const jumpClientInstallerEntityToBeCreated = {
                id: 123,
                jumpGroupId: 1,
                jumpGroupType: JumpClientGroupType.Personal,
            } as JumpClientInstallerEntity;
            const jumpClientInstallerEntityCreateMethod = jest
                .spyOn(JumpClientInstallerEntity, 'create')
                .mockReturnValue(jumpClientInstallerEntityToBeCreated);
            const expectedError = new Error('Error');
            const jumpClientInstallerRepositoryServiceCreateMethod = jest
                .spyOn(jumpClientInstallerRepositoryService, 'create')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<CreateJumpClientInstallerCommand>{
                    transactionId: 'transaction-1',
                    jumpGroupId: 1,
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(jumpClientInstallerEntityCreateMethod).toHaveBeenCalled();
            expect(jumpClientInstallerRepositoryServiceCreateMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: JumpClientInstallerCreationFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        jumpClientInstaller: jumpClientInstallerEntityToBeCreated,
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
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedJumpClientInstallerCreatedDtoOutput);

    return commandBus;
}

function mockJumpClientInstallerRepositoryService() {
    const jumpClientInstallerRepositoryService = {} as JumpClientInstallerRepositoryService;
    jumpClientInstallerRepositoryService.create = jest.fn();
    jumpClientInstallerRepositoryService.findOneBy = jest.fn().mockResolvedValue(null);

    return jumpClientInstallerRepositoryService;
}
