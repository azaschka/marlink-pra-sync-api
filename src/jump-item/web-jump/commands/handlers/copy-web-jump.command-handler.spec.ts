import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { CopyWebJumpCommand as BTCopyWebJumpCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/web-jump/commands';
import {
    WebJumpCopiedDtoOutput,
    WebJumpRetrievedDtoOutput,
} from '../../../../beyondtrust-pra-conf-api/jump-item/web-jump/dtos/outputs';
import {
    JumpGroupType as BTJumpGroupType,
    WebJumpUsernameFormatType as BTWebJumpUsernameFormatType,
} from '../../../../beyondtrust-pra-conf-api/jump-item/web-jump/enums';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { JumpGroupType, WebJumpUsernameFormatType } from '../../enums';
import { WebJumpCopiedEvent, WebJumpCopyFailedEvent } from '../../events';
import { WebJumpEntity } from '../../repositories/entities';
import { WebJumpRepositoryService } from '../../repositories/services/web-jump-repository.service';
import { CopyWebJumpCommand } from '../copy-web-jump.command';
import { CopyWebJumpCommandHandler } from './copy-web-jump.command-handler';

// Mock mapper function to return original/input value
jest.mock('../../mappers', () => ({
    mapFromBTJumpGroupType: jest.fn().mockImplementation((type: BTJumpGroupType) => type),
    mapToBTJumpGroupType: jest.fn().mockImplementation((type: JumpGroupType) => type),
    mapFromBTWebJumpUsernameFormatType: jest.fn().mockImplementation((type: BTWebJumpUsernameFormatType) => type),
    mapToBTWebJumpUsernameFormatType: jest.fn().mockImplementation((type: WebJumpUsernameFormatType) => type),
}));

abstract class TestHelper {
    public static get mockedWebJumpCopiedDtoOutput(): WebJumpCopiedDtoOutput {
        return {
            action: 'copy',
            success: 'success',
            destId: 1,
        };
    }

    public static get mockedWebJumpRetrievedDtoOutput(): WebJumpRetrievedDtoOutput {
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

describe('CopyWebJumpCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let queryBus: QueryBus;
    let webJumpRepositoryService: WebJumpRepositoryService;
    let handler: CopyWebJumpCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        queryBus = mockQueryBus();
        webJumpRepositoryService = mockWebJumpRepositoryService();
        handler = new CopyWebJumpCommandHandler(commandBus, eventBus, queryBus, webJumpRepositoryService);
    });

    describe('execute', () => {
        it('should call the command bus and repository service with correct parameters, publish an event and return the result', async () => {
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
            const result = await handler.execute(<CopyWebJumpCommand>{
                transactionId: 'transaction-1',
                id: 1,
                jumpGroupId: 3,
                jumpGroupType: JumpGroupType.Personal,
                name: 'web-jump-1',
            });

            // Assert
            expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                new BTCopyWebJumpCommand('transaction-1', 1, 3, JumpGroupType.Personal, 'web-jump-1'),
            );
            expect(webJumpEntityCreateMethod).toHaveBeenCalledWith(
                TestHelper.mockedWebJumpRetrievedDtoOutput.id,
                TestHelper.mockedWebJumpRetrievedDtoOutput.name,
                TestHelper.mockedWebJumpRetrievedDtoOutput.jumpointId,
                TestHelper.mockedWebJumpRetrievedDtoOutput.url,
                TestHelper.mockedWebJumpRetrievedDtoOutput.jumpGroupId,
                TestHelper.mockedWebJumpRetrievedDtoOutput.jumpGroupType,
                TestHelper.mockedWebJumpRetrievedDtoOutput.usernameFormat,
                TestHelper.mockedWebJumpRetrievedDtoOutput.verifyCertificate,
                TestHelper.mockedWebJumpRetrievedDtoOutput.authenticationTimeout,
                TestHelper.mockedWebJumpRetrievedDtoOutput.tag,
                TestHelper.mockedWebJumpRetrievedDtoOutput.comments,
                TestHelper.mockedWebJumpRetrievedDtoOutput.jumpPolicyId,
                TestHelper.mockedWebJumpRetrievedDtoOutput.usernameField,
                TestHelper.mockedWebJumpRetrievedDtoOutput.passwordField,
                TestHelper.mockedWebJumpRetrievedDtoOutput.submitField,
                TestHelper.mockedWebJumpRetrievedDtoOutput.sessionPolicyId,
            );
            expect(webJumpRepositoryServiceCreateMethod).toHaveBeenCalledWith(webJumpEntityToBeCreated);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining(<WebJumpCopiedEvent>{
                    transactionId: 'transaction-1',
                    eventType: WebJumpCopiedEvent.EVENT_TYPE,
                    payload: {
                        webJump: result,
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
                handler.execute(<CopyWebJumpCommand>{
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
                handler.execute(<CopyWebJumpCommand>{
                    transactionId: 'transaction-1',
                    name: 'web-jump-1',
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(webJumpEntityCreateMethod).toHaveBeenCalled();
            expect(webJumpRepositoryServiceCreateMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: WebJumpCopyFailedEvent.EVENT_TYPE,
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
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedWebJumpCopiedDtoOutput);

    return commandBus;
}

function mockQueryBus() {
    const queryBus = {} as QueryBus;
    queryBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedWebJumpRetrievedDtoOutput);

    return queryBus;
}

function mockWebJumpRepositoryService() {
    const webJumpRepositoryService = {} as WebJumpRepositoryService;
    webJumpRepositoryService.create = jest.fn();

    return webJumpRepositoryService;
}
