import { ConflictException } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { CreateWebJumpCommand as BTCreateWebJumpCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/web-jump/commands';
import { WebJumpCreatedDtoOutput } from '../../../../beyondtrust-pra-conf-api/jump-item/web-jump/dtos/outputs';
import {
    JumpGroupType as BTJumpGroupType,
    WebJumpUsernameFormatType as BTWebJumpUsernameFormatType,
} from '../../../../beyondtrust-pra-conf-api/jump-item/web-jump/enums';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { JumpGroupType, WebJumpUsernameFormatType } from '../../enums';
import { WebJumpCreatedEvent, WebJumpCreationFailedEvent } from '../../events';
import { WebJumpEntity } from '../../repositories/entities';
import { WebJumpRepositoryService } from '../../repositories/services/web-jump-repository.service';
import { CreateWebJumpCommand } from '../create-web-jump.command';
import { CreateWebJumpCommandHandler } from './create-web-jump.command-handler';

// Mock mapper function to return original/input value
jest.mock('../../mappers', () => ({
    mapFromBTJumpGroupType: jest.fn().mockImplementation((type: BTJumpGroupType) => type),
    mapToBTJumpGroupType: jest.fn().mockImplementation((type: JumpGroupType) => type),
    mapFromBTWebJumpUsernameFormatType: jest.fn().mockImplementation((type: BTWebJumpUsernameFormatType) => type),
    mapToBTWebJumpUsernameFormatType: jest.fn().mockImplementation((type: WebJumpUsernameFormatType) => type),
}));

abstract class TestHelper {
    public static get mockedWebJumpCreatedDtoOutput(): WebJumpCreatedDtoOutput {
        return {
            id: 1,
            name: 'web-jump-1',
            jumpointId: 2,
            url: 'url-1',
            jumpGroupId: 3,
            jumpGroupType: BTJumpGroupType.Personal,
            usernameFormat: BTWebJumpUsernameFormatType.ForceDllnFormat,
            verifyCertificate: true,
            authenticationTimeout: 30,
            tag: 'tag-1',
            comments: 'comments-1',
            jumpPolicyId: 3,
            usernameField: 'username-field-1',
            passwordField: 'password-field-1',
            submitField: 'submit-field-1',
            sessionPolicyId: 4,
        };
    }
}

describe('CreateWebJumpCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let webJumpRepositoryService: WebJumpRepositoryService;
    let handler: CreateWebJumpCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        webJumpRepositoryService = mockWebJumpRepositoryService();
        handler = new CreateWebJumpCommandHandler(commandBus, eventBus, webJumpRepositoryService);
    });

    describe('execute', () => {
        it('should throw a ConflictException if a Web Jump with the same name, jump group id and tag already exists', async () => {
            // Arrange
            const command = <CreateWebJumpCommand>{
                transactionId: 'transaction-1',
                name: 'web-jump-1',
                jumpointId: 2,
                url: 'url-1',
                jumpGroupId: 3,
                tag: 'tag-1',
            };
            jest.spyOn(webJumpRepositoryService, 'findOneBy').mockResolvedValue({
                id: 123,
            } as WebJumpEntity);

            // Act & Assert
            await expect(handler.execute(command)).rejects.toThrow(ConflictException);
        });

        it.each([
            <CreateWebJumpCommand>{
                transactionId: 'transaction-1',
                tenantId: 123,
                name: 'web-jump-1',
                jumpointId: 2,
                url: 'url-1',
                jumpGroupId: 3,
                jumpGroupType: JumpGroupType.Personal,
                usernameFormatType: WebJumpUsernameFormatType.ForceDllnFormat,
                mustVerifyCertificate: true,
                authenticationTimeoutInSeconds: 30,
                tag: 'tag-1',
                comments: 'comments-1',
                jumpPolicyId: 3,
                usernameField: 'username-field-1',
                passwordField: 'password-field-1',
                submitField: 'submit-field-1',
                sessionPolicyId: 4,
            },
            <CreateWebJumpCommand>{
                transactionId: 'transaction-2',
                tenantId: 123,
                name: 'web-jump-2',
                jumpointId: 2,
                url: 'url-2',
                jumpGroupId: 3,
            },
        ])(
            'should call the command bus and repository service with correct parameters, publish an event and return the result',
            async (command) => {
                // Arrange
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
                const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

                const webJumpEntityToBeCreated = { id: 123 } as WebJumpEntity;
                const webJumpEntityCreateMethod = jest
                    .spyOn(WebJumpEntity, 'create')
                    .mockReturnValue(webJumpEntityToBeCreated);

                const expectedResult = { id: 321 } as WebJumpEntity;
                const webJumpRepositoryServiceCreateMethod = jest
                    .spyOn(webJumpRepositoryService, 'create')
                    .mockResolvedValue(expectedResult);

                // Act
                const result = await handler.execute(command);

                // Assert
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTCreateWebJumpCommand(
                        command.transactionId,
                        command.name,
                        command.jumpointId,
                        command.url,
                        command.jumpGroupId,
                        command.jumpGroupType,
                        command.usernameFormatType as unknown as BTWebJumpUsernameFormatType,
                        command.mustVerifyCertificate,
                        command.authenticationTimeoutInSeconds,
                        command.tag,
                        command.comments,
                        command.jumpPolicyId,
                        command.usernameField,
                        command.passwordField,
                        command.submitField,
                        command.sessionPolicyId,
                    ),
                );
                expect(webJumpEntityCreateMethod).toHaveBeenCalledWith(
                    TestHelper.mockedWebJumpCreatedDtoOutput.id,
                    TestHelper.mockedWebJumpCreatedDtoOutput.name,
                    TestHelper.mockedWebJumpCreatedDtoOutput.jumpointId,
                    TestHelper.mockedWebJumpCreatedDtoOutput.url,
                    TestHelper.mockedWebJumpCreatedDtoOutput.jumpGroupId,
                    TestHelper.mockedWebJumpCreatedDtoOutput.jumpGroupType,
                    TestHelper.mockedWebJumpCreatedDtoOutput.usernameFormat,
                    TestHelper.mockedWebJumpCreatedDtoOutput.verifyCertificate,
                    TestHelper.mockedWebJumpCreatedDtoOutput.authenticationTimeout,
                    TestHelper.mockedWebJumpCreatedDtoOutput.tag,
                    TestHelper.mockedWebJumpCreatedDtoOutput.comments,
                    TestHelper.mockedWebJumpCreatedDtoOutput.jumpPolicyId,
                    TestHelper.mockedWebJumpCreatedDtoOutput.usernameField,
                    TestHelper.mockedWebJumpCreatedDtoOutput.passwordField,
                    TestHelper.mockedWebJumpCreatedDtoOutput.submitField,
                    TestHelper.mockedWebJumpCreatedDtoOutput.sessionPolicyId,
                );
                expect(webJumpRepositoryServiceCreateMethod).toHaveBeenCalledWith(123, webJumpEntityToBeCreated);
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<WebJumpCreatedEvent>{
                        transactionId: command.transactionId,
                        eventType: WebJumpCreatedEvent.EVENT_TYPE,
                        payload: {
                            webJump: result,
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
                handler.execute(<CreateWebJumpCommand>{
                    transactionId: 'transaction-1',
                    name: 'web-jump-1',
                }),
            ).rejects.toThrow('Error');
            expect(commandBusExecuteMethod).toHaveBeenCalled();
        });

        it('should throw an error and publish an event if the repository service fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const webJumpEntityToBeCreated = { name: 'web-jump-1', id: 123 } as WebJumpEntity;
            const webJumpEntityCreateMethod = jest
                .spyOn(WebJumpEntity, 'create')
                .mockReturnValue(webJumpEntityToBeCreated);
            const expectedError = new Error('Error');
            const webJumpRepositoryServiceCreateMethod = jest
                .spyOn(webJumpRepositoryService, 'create')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<CreateWebJumpCommand>{
                    transactionId: 'transaction-1',
                    name: 'web-jump-1',
                    tenantId: 123,
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(webJumpEntityCreateMethod).toHaveBeenCalled();
            expect(webJumpRepositoryServiceCreateMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: WebJumpCreationFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        webJump: webJumpEntityToBeCreated,
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
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedWebJumpCreatedDtoOutput);

    return commandBus;
}

function mockWebJumpRepositoryService() {
    const webJumpRepositoryService = {} as WebJumpRepositoryService;
    webJumpRepositoryService.create = jest.fn();
    webJumpRepositoryService.findOneBy = jest.fn().mockResolvedValue(null);

    return webJumpRepositoryService;
}
