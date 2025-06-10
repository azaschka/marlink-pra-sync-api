import { CommandBus, EventBus } from '@nestjs/cqrs';
import { ModifyWebJumpCommand as BTModifyWebJumpCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/web-jump/commands';
import { WebJumpModifiedDtoOutput } from '../../../../beyondtrust-pra-conf-api/jump-item/web-jump/dtos/outputs';
import {
    JumpGroupType as BTJumpGroupType,
    WebJumpUsernameFormatType as BTWebJumpUsernameFormatType,
} from '../../../../beyondtrust-pra-conf-api/jump-item/web-jump/enums';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { JumpGroupType, WebJumpUsernameFormatType } from '../../enums';
import { WebJumpModificationFailedEvent, WebJumpModifiedEvent } from '../../events';
import { WebJumpEntity } from '../../repositories/entities';
import { WebJumpRepositoryService } from '../../repositories/services/web-jump-repository.service';
import { ModifyWebJumpCommand } from '../modify-web-jump.command';
import { ModifyWebJumpCommandHandler } from './modify-web-jump.command-handler';

// Mock mapper function to return original/input value
jest.mock('../../mappers', () => ({
    mapFromBTJumpGroupType: jest.fn().mockImplementation((type: BTJumpGroupType) => type),
    mapToBTJumpGroupType: jest.fn().mockImplementation((type: JumpGroupType) => type),
    mapFromBTWebJumpUsernameFormatType: jest.fn().mockImplementation((type: BTWebJumpUsernameFormatType) => type),
    mapToBTWebJumpUsernameFormatType: jest.fn().mockImplementation((type: WebJumpUsernameFormatType) => type),
}));

abstract class TestHelper {
    public static get mockedWebJumpModifiedDtoOutput(): WebJumpModifiedDtoOutput {
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

describe('ModifyWebJumpCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let webJumpRepositoryService: WebJumpRepositoryService;
    let handler: ModifyWebJumpCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        webJumpRepositoryService = mockWebJumpRepositoryService();
        handler = new ModifyWebJumpCommandHandler(commandBus, eventBus, webJumpRepositoryService);
    });

    describe('execute', () => {
        it.each([
            <ModifyWebJumpCommand>{
                transactionId: 'transaction-1',
                id: 1,
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
            <ModifyWebJumpCommand>{
                transactionId: 'transaction-2',
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

                const webJumpEntityToBeUpdated = { id: 123 } as WebJumpEntity;
                const webJumpEntityCreateMethod = jest
                    .spyOn(WebJumpEntity, 'create')
                    .mockReturnValue(webJumpEntityToBeUpdated);

                const expectedResult = { id: 321 } as WebJumpEntity;
                const webJumpRepositoryServiceCreateOrUpdateByIdMethod = jest
                    .spyOn(webJumpRepositoryService, 'createOrUpdateById')
                    .mockResolvedValue(Promise.resolve());
                const webJumpRepositoryServiceFindByIdMethod = jest
                    .spyOn(webJumpRepositoryService, 'findOneById')
                    .mockResolvedValue(Promise.resolve(expectedResult));

                // Act
                const result = await handler.execute(command);

                // Assert
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTModifyWebJumpCommand(
                        command.transactionId,
                        command.id,
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
                    TestHelper.mockedWebJumpModifiedDtoOutput.id,
                    TestHelper.mockedWebJumpModifiedDtoOutput.name,
                    TestHelper.mockedWebJumpModifiedDtoOutput.jumpointId,
                    TestHelper.mockedWebJumpModifiedDtoOutput.url,
                    TestHelper.mockedWebJumpModifiedDtoOutput.jumpGroupId,
                    TestHelper.mockedWebJumpModifiedDtoOutput.jumpGroupType,
                    TestHelper.mockedWebJumpModifiedDtoOutput.usernameFormat,
                    TestHelper.mockedWebJumpModifiedDtoOutput.verifyCertificate,
                    TestHelper.mockedWebJumpModifiedDtoOutput.authenticationTimeout,
                    TestHelper.mockedWebJumpModifiedDtoOutput.tag,
                    TestHelper.mockedWebJumpModifiedDtoOutput.comments,
                    TestHelper.mockedWebJumpModifiedDtoOutput.jumpPolicyId,
                    TestHelper.mockedWebJumpModifiedDtoOutput.usernameField,
                    TestHelper.mockedWebJumpModifiedDtoOutput.passwordField,
                    TestHelper.mockedWebJumpModifiedDtoOutput.submitField,
                    TestHelper.mockedWebJumpModifiedDtoOutput.sessionPolicyId,
                );
                expect(webJumpRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalledWith(webJumpEntityToBeUpdated);
                expect(webJumpRepositoryServiceFindByIdMethod).toHaveBeenCalledWith(webJumpEntityToBeUpdated.id);
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<WebJumpModifiedEvent>{
                        transactionId: command.transactionId,
                        eventType: WebJumpModifiedEvent.EVENT_TYPE,
                        payload: {
                            webJump: result,
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
                handler.execute(<ModifyWebJumpCommand>{
                    transactionId: 'transaction-1',
                    name: 'web-jump-1',
                }),
            ).rejects.toThrow('Error');
            expect(commandBusExecuteMethod).toHaveBeenCalled();
        });

        it('should throw an error if the retrieval from repository returns null', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const webJumpEntityToBeCreated = { name: 'web-jump-1', id: 123 } as WebJumpEntity;
            const webJumpEntityCreateMethod = jest
                .spyOn(WebJumpEntity, 'create')
                .mockReturnValue(webJumpEntityToBeCreated);
            const webJumpRepositoryServiceCreateOrUpdateByIdMethod = jest.spyOn(
                webJumpRepositoryService,
                'createOrUpdateById',
            );
            const webJumpRepositoryServiceFindByIdMethod = jest
                .spyOn(webJumpRepositoryService, 'findOneById')
                .mockResolvedValue(null);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<ModifyWebJumpCommand>{
                    transactionId: 'transaction-1',
                    name: 'web-jump-1',
                }),
            ).rejects.toThrow();
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(webJumpEntityCreateMethod).toHaveBeenCalled();
            expect(webJumpRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalled();
            expect(webJumpRepositoryServiceFindByIdMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalled();
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: WebJumpModificationFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        webJump: webJumpEntityToBeCreated,
                    },
                }),
            );
        });

        it('should throw an error and publish an event if the repository service fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const webJumpEntityToBeCreated = { name: 'web-jump-1', id: 123 } as WebJumpEntity;
            const webJumpEntityCreateMethod = jest
                .spyOn(WebJumpEntity, 'create')
                .mockReturnValue(webJumpEntityToBeCreated);
            const expectedError = new Error('Error');
            const webJumpRepositoryServiceCreateOrUpdateByIdMethod = jest
                .spyOn(webJumpRepositoryService, 'createOrUpdateById')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<ModifyWebJumpCommand>{
                    transactionId: 'transaction-1',
                    name: 'web-jump-1',
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(webJumpEntityCreateMethod).toHaveBeenCalled();
            expect(webJumpRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: WebJumpModificationFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        webJump: webJumpEntityToBeCreated,
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
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedWebJumpModifiedDtoOutput);

    return commandBus;
}

function mockWebJumpRepositoryService() {
    const webJumpRepositoryService = {} as WebJumpRepositoryService;
    webJumpRepositoryService.createOrUpdateById = jest.fn();
    webJumpRepositoryService.findOneById = jest.fn();

    return webJumpRepositoryService;
}
