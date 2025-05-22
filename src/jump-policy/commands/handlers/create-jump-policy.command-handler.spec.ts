import { CommandBus, EventBus } from '@nestjs/cqrs';
import { CreateJumpPolicyCommand as BTCreateJumpPolicyCommand } from '../../../beyondtrust-pra-conf-api/jump-policy/commands';
import { JumpPolicyCreatedDtoOutput } from '../../../beyondtrust-pra-conf-api/jump-policy/dtos/outputs';
import {
    ApprovalApproverScopeType as BTApprovalApproverScopeType,
    ApprovalScopeType as BTApprovalScopeType,
    SimultaneousJumpsRdpType as BTSimultaneousJumpsRdpType,
    SimultaneousJumpsType as BTSimultaneousJumpsType,
} from '../../../beyondtrust-pra-conf-api/jump-policy/enums';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import {
    ApprovalApproverScopeType,
    ApprovalScopeType,
    SimultaneousJumpsRdpType,
    SimultaneousJumpsType,
} from '../../enums';
import { JumpPolicyCreatedEvent, JumpPolicyCreationFailedEvent } from '../../events';
import { JumpPolicyEntity } from '../../repositories/entities';
import { JumpPolicyRepositoryService } from '../../repositories/services/jump-policy-repository.service';
import { CreateJumpPolicyCommand } from '../create-jump-policy.command';
import { CreateJumpPolicyCommandHandler } from './create-jump-policy.command-handler';

// Mock mapper function to return original/input value
jest.mock('../../mappers', () => ({
    mapFromBTSimultaneousJumpsType: jest.fn().mockImplementation((type: BTSimultaneousJumpsType) => type),
    mapToBTSimultaneousJumpsType: jest.fn().mockImplementation((type: SimultaneousJumpsType) => type),
    mapFromBTSimultaneousJumpsRdpType: jest.fn().mockImplementation((type: BTSimultaneousJumpsRdpType) => type),
    mapToBTSimultaneousJumpsRdpType: jest.fn().mockImplementation((type: SimultaneousJumpsRdpType) => type),
    mapFromBTApprovalScopeType: jest.fn().mockImplementation((type: BTApprovalScopeType) => type),
    mapToBTApprovalScopeType: jest.fn().mockImplementation((type: ApprovalScopeType) => type),
    mapFromBTApprovalApproverScopeType: jest.fn().mockImplementation((type: BTApprovalApproverScopeType) => type),
    mapToBTApprovalApproverScopeType: jest.fn().mockImplementation((type: ApprovalApproverScopeType) => type),
}));

abstract class TestHelper {
    public static get mockedJumpPolicyCreatedDtoOutput(): JumpPolicyCreatedDtoOutput {
        return {
            id: 1,
            displayName: 'jump-policy-1',
            codeName: 'jump-policy-code-1',
            description: 'jump-policy-description-1',
            scheduleEnabled: true,
            simultaneousJumps: BTSimultaneousJumpsType.Global,
            simultaneousJumpBehaviorAppliesToCopies: true,
            simultaneousJumpsRdp: BTSimultaneousJumpsRdpType.NewSession,
            scheduleStrict: false,
            ticketIdRequired: true,
            twoFactorChallengeRequired: false,
            sessionStartNotification: true,
            sessionEndNotification: false,
            notificationEmailAddresses: ['email1@example.com', 'email2@example.com'],
            notificationDisplayName: 'notif-display',
            notificationEmailLanguage: 'en',
            approvalRequired: true,
            approvalMaxDuration: 120,
            approvalScope: BTApprovalScopeType.Anyone,
            approvalEmailAddresses: ['approval1@example.com'],
            approvalUserIds: ['user1', 'user2'],
            approvalTeamIds: ['team1', 'team2'],
            approvalDisplayName: 'approval-display',
            approvalEmailLanguage: 'fr',
            approvalApproverScope: BTApprovalApproverScopeType.Anyone,
            recordingsDisabled: true,
        };
    }
}

describe('CreateJumpPolicyCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let jumpPolicyRepositoryService: JumpPolicyRepositoryService;
    let handler: CreateJumpPolicyCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        jumpPolicyRepositoryService = mockJumpPolicyRepositoryService();
        handler = new CreateJumpPolicyCommandHandler(commandBus, eventBus, jumpPolicyRepositoryService);
    });

    describe('execute', () => {
        it.each([
            <CreateJumpPolicyCommand>{
                transactionId: 'transaction-1',
                displayName: 'jump-policy-1',
                codeName: 'jump-policy-code-1',
                description: 'jump-policy-description-1',
                hasScheduledAccessRestriction: true,
                simultaneousJumpsType: SimultaneousJumpsType.Global,
                doesSimultaneousJumpBehaviorApplyToCopies: true,
                simultaneousJumpsRdpType: SimultaneousJumpsRdpType.NewSession,
                shouldForceRemoveUsersWhenScheduleDisallows: false,
                isTicketIdRequired: true,
                isTwoFactorChallengeRequired: false,
                isSessionStartNotificationEnabled: true,
                isSessionEndNotificationEnabled: false,
                notificationEmailAddresses: ['email1@example.com', 'email2@example.com'],
                notificationDisplayName: 'notif-display',
                notificationEmailLanguage: 'en',
                isApprovalRequired: true,
                approvalMaxDurationInMinutes: 120,
                approvalScopeType: ApprovalScopeType.Anyone,
                approvalEmailAddresses: ['approval1@example.com'],
                approvalUserIds: ['user1', 'user2'],
                approvalTeamIds: ['team1', 'team2'],
                approvalDisplayName: 'approval-display',
                approvalEmailLanguage: 'fr',
                approvalApproverScopeType: ApprovalApproverScopeType.Anyone,
                isRecordingsDisabled: true,
            },
            <CreateJumpPolicyCommand>{
                transactionId: 'transaction-2',
                displayName: 'jump-policy-2',
            },
        ])(
            'should call the command bus and repository service with correct parameters, publish an event and return the result',
            async (command) => {
                // Arrange
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
                const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

                const jumpPolicyEntityToBeCreated = { id: 123 } as JumpPolicyEntity;
                const jumpPolicyEntityCreateMethod = jest
                    .spyOn(JumpPolicyEntity, 'create')
                    .mockReturnValue(jumpPolicyEntityToBeCreated);

                const expectedResult = { id: 321 } as JumpPolicyEntity;
                const jumpPolicyRepositoryServiceCreateMethod = jest
                    .spyOn(jumpPolicyRepositoryService, 'create')
                    .mockResolvedValue(expectedResult);

                // Act
                const result = await handler.execute(command);

                // Assert
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTCreateJumpPolicyCommand(
                        command.transactionId,
                        command.displayName,
                        command.codeName,
                        command.description,
                        command.hasScheduledAccessRestriction,
                        command.simultaneousJumpsType,
                        command.doesSimultaneousJumpBehaviorApplyToCopies,
                        command.simultaneousJumpsRdpType as unknown as BTSimultaneousJumpsRdpType,
                        command.shouldForceRemoveUsersWhenScheduleDisallows,
                        command.isTicketIdRequired,
                        command.isTwoFactorChallengeRequired,
                        command.isSessionStartNotificationEnabled,
                        command.isSessionEndNotificationEnabled,
                        command.notificationEmailAddresses,
                        command.notificationDisplayName,
                        command.notificationEmailLanguage,
                        command.isApprovalRequired,
                        command.approvalMaxDurationInMinutes,
                        command.approvalScopeType,
                        command.approvalEmailAddresses,
                        command.approvalUserIds,
                        command.approvalTeamIds,
                        command.approvalDisplayName,
                        command.approvalEmailLanguage,
                        command.approvalApproverScopeType as unknown as BTApprovalApproverScopeType,
                        command.isRecordingsDisabled,
                    ),
                );
                expect(jumpPolicyEntityCreateMethod).toHaveBeenCalledWith(
                    TestHelper.mockedJumpPolicyCreatedDtoOutput.id,
                    TestHelper.mockedJumpPolicyCreatedDtoOutput.displayName,
                    TestHelper.mockedJumpPolicyCreatedDtoOutput.codeName,
                    TestHelper.mockedJumpPolicyCreatedDtoOutput.description,
                    TestHelper.mockedJumpPolicyCreatedDtoOutput.scheduleEnabled,
                    TestHelper.mockedJumpPolicyCreatedDtoOutput.simultaneousJumps,
                    TestHelper.mockedJumpPolicyCreatedDtoOutput.simultaneousJumpBehaviorAppliesToCopies,
                    TestHelper.mockedJumpPolicyCreatedDtoOutput.simultaneousJumpsRdp,
                    TestHelper.mockedJumpPolicyCreatedDtoOutput.scheduleStrict,
                    TestHelper.mockedJumpPolicyCreatedDtoOutput.ticketIdRequired,
                    TestHelper.mockedJumpPolicyCreatedDtoOutput.twoFactorChallengeRequired,
                    TestHelper.mockedJumpPolicyCreatedDtoOutput.sessionStartNotification,
                    TestHelper.mockedJumpPolicyCreatedDtoOutput.sessionEndNotification,
                    TestHelper.mockedJumpPolicyCreatedDtoOutput.notificationEmailAddresses,
                    TestHelper.mockedJumpPolicyCreatedDtoOutput.notificationDisplayName,
                    TestHelper.mockedJumpPolicyCreatedDtoOutput.notificationEmailLanguage,
                    TestHelper.mockedJumpPolicyCreatedDtoOutput.approvalRequired,
                    TestHelper.mockedJumpPolicyCreatedDtoOutput.approvalMaxDuration,
                    TestHelper.mockedJumpPolicyCreatedDtoOutput.approvalScope,
                    TestHelper.mockedJumpPolicyCreatedDtoOutput.approvalEmailAddresses,
                    TestHelper.mockedJumpPolicyCreatedDtoOutput.approvalUserIds,
                    TestHelper.mockedJumpPolicyCreatedDtoOutput.approvalTeamIds,
                    TestHelper.mockedJumpPolicyCreatedDtoOutput.approvalDisplayName,
                    TestHelper.mockedJumpPolicyCreatedDtoOutput.approvalEmailLanguage,
                    TestHelper.mockedJumpPolicyCreatedDtoOutput.approvalApproverScope,
                    TestHelper.mockedJumpPolicyCreatedDtoOutput.recordingsDisabled,
                );
                expect(jumpPolicyRepositoryServiceCreateMethod).toHaveBeenCalledWith(jumpPolicyEntityToBeCreated);
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<JumpPolicyCreatedEvent>{
                        transactionId: command.transactionId,
                        eventType: JumpPolicyCreatedEvent.EVENT_TYPE,
                        payload: {
                            jumpPolicy: result,
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
                handler.execute(<CreateJumpPolicyCommand>{
                    transactionId: 'transaction-1',
                    displayName: 'jump-policy-1',
                }),
            ).rejects.toThrow('Error');
            expect(commandBusExecuteMethod).toHaveBeenCalled();
        });

        it('should throw an error and publish an event if the repository service fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const jumpPolicyEntityToBeCreated = { displayName: 'jump-policy-1', id: 123 } as JumpPolicyEntity;
            const jumpPolicyEntityCreateMethod = jest
                .spyOn(JumpPolicyEntity, 'create')
                .mockReturnValue(jumpPolicyEntityToBeCreated);
            const expectedError = new Error('Error');
            const jumpPolicyRepositoryServiceCreateMethod = jest
                .spyOn(jumpPolicyRepositoryService, 'create')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<CreateJumpPolicyCommand>{
                    transactionId: 'transaction-1',
                    displayName: 'jump-policy-1',
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(jumpPolicyEntityCreateMethod).toHaveBeenCalled();
            expect(jumpPolicyRepositoryServiceCreateMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: JumpPolicyCreationFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        jumpPolicy: jumpPolicyEntityToBeCreated,
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
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedJumpPolicyCreatedDtoOutput);

    return commandBus;
}

function mockJumpPolicyRepositoryService() {
    const jumpPolicyRepositoryService = {} as JumpPolicyRepositoryService;
    jumpPolicyRepositoryService.create = jest.fn();

    return jumpPolicyRepositoryService;
}
