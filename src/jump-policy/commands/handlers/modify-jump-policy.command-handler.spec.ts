import { CommandBus, EventBus } from '@nestjs/cqrs';
import { ModifyJumpPolicyCommand as BTModifyJumpPolicyCommand } from '../../../beyondtrust-pra-conf-api/jump-policy/commands';
import { JumpPolicyModifiedDtoOutput } from '../../../beyondtrust-pra-conf-api/jump-policy/dtos/outputs';
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
import { JumpPolicyModificationFailedEvent, JumpPolicyModifiedEvent } from '../../events';
import { JumpPolicyEntity } from '../../repositories/entities';
import { JumpPolicyRepositoryService } from '../../repositories/services/jump-policy-repository.service';
import { ModifyJumpPolicyCommand } from '../modify-jump-policy.command';
import { ModifyJumpPolicyCommandHandler } from './modify-jump-policy.command-handler';

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
    public static get mockedJumpPolicyModifiedDtoOutput(): JumpPolicyModifiedDtoOutput {
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

describe('ModifyJumpPolicyCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let jumpPolicyRepositoryService: JumpPolicyRepositoryService;
    let handler: ModifyJumpPolicyCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        jumpPolicyRepositoryService = mockJumpPolicyRepositoryService();
        handler = new ModifyJumpPolicyCommandHandler(commandBus, eventBus, jumpPolicyRepositoryService);
    });

    describe('execute', () => {
        it.each([
            <ModifyJumpPolicyCommand>{
                transactionId: 'transaction-1',
                tenantId: 123,
                id: 1,
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
            <ModifyJumpPolicyCommand>{
                transactionId: 'transaction-2',
                tenantId: 123,
                id: 2,
                displayName: 'jump-policy-2',
            },
        ])(
            'should call the command bus and repository service with correct parameters, publish an event and return the result',
            async (command) => {
                // Arrange
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
                const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

                const jumpPolicyEntityToBeUpdated = { id: 123 } as JumpPolicyEntity;
                const jumpPolicyEntityCreateMethod = jest
                    .spyOn(JumpPolicyEntity, 'create')
                    .mockReturnValue(jumpPolicyEntityToBeUpdated);

                const expectedResult = { id: 321 } as JumpPolicyEntity;
                const jumpPolicyRepositoryServiceCreateOrUpdateByIdMethod = jest
                    .spyOn(jumpPolicyRepositoryService, 'createOrUpdateById')
                    .mockResolvedValue(Promise.resolve());
                const jumpPolicyRepositoryServiceFindByIdMethod = jest
                    .spyOn(jumpPolicyRepositoryService, 'findOneById')
                    .mockResolvedValue(Promise.resolve(expectedResult));

                // Act
                const result = await handler.execute(command);

                // Assert
                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTModifyJumpPolicyCommand(
                        command.transactionId,
                        command.tenantId,
                        command.id,
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
                    TestHelper.mockedJumpPolicyModifiedDtoOutput.id,
                    TestHelper.mockedJumpPolicyModifiedDtoOutput.displayName,
                    TestHelper.mockedJumpPolicyModifiedDtoOutput.codeName,
                    TestHelper.mockedJumpPolicyModifiedDtoOutput.description,
                    TestHelper.mockedJumpPolicyModifiedDtoOutput.scheduleEnabled,
                    TestHelper.mockedJumpPolicyModifiedDtoOutput.simultaneousJumps,
                    TestHelper.mockedJumpPolicyModifiedDtoOutput.simultaneousJumpBehaviorAppliesToCopies,
                    TestHelper.mockedJumpPolicyModifiedDtoOutput.simultaneousJumpsRdp,
                    TestHelper.mockedJumpPolicyModifiedDtoOutput.scheduleStrict,
                    TestHelper.mockedJumpPolicyModifiedDtoOutput.ticketIdRequired,
                    TestHelper.mockedJumpPolicyModifiedDtoOutput.twoFactorChallengeRequired,
                    TestHelper.mockedJumpPolicyModifiedDtoOutput.sessionStartNotification,
                    TestHelper.mockedJumpPolicyModifiedDtoOutput.sessionEndNotification,
                    TestHelper.mockedJumpPolicyModifiedDtoOutput.notificationEmailAddresses,
                    TestHelper.mockedJumpPolicyModifiedDtoOutput.notificationDisplayName,
                    TestHelper.mockedJumpPolicyModifiedDtoOutput.notificationEmailLanguage,
                    TestHelper.mockedJumpPolicyModifiedDtoOutput.approvalRequired,
                    TestHelper.mockedJumpPolicyModifiedDtoOutput.approvalMaxDuration,
                    TestHelper.mockedJumpPolicyModifiedDtoOutput.approvalScope,
                    TestHelper.mockedJumpPolicyModifiedDtoOutput.approvalEmailAddresses,
                    TestHelper.mockedJumpPolicyModifiedDtoOutput.approvalUserIds,
                    TestHelper.mockedJumpPolicyModifiedDtoOutput.approvalTeamIds,
                    TestHelper.mockedJumpPolicyModifiedDtoOutput.approvalDisplayName,
                    TestHelper.mockedJumpPolicyModifiedDtoOutput.approvalEmailLanguage,
                    TestHelper.mockedJumpPolicyModifiedDtoOutput.approvalApproverScope,
                    TestHelper.mockedJumpPolicyModifiedDtoOutput.recordingsDisabled,
                );
                expect(jumpPolicyRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalledWith(
                    123,
                    jumpPolicyEntityToBeUpdated,
                );
                expect(jumpPolicyRepositoryServiceFindByIdMethod).toHaveBeenCalledWith(
                    123,
                    jumpPolicyEntityToBeUpdated.id,
                );
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<JumpPolicyModifiedEvent>{
                        transactionId: command.transactionId,
                        eventType: JumpPolicyModifiedEvent.EVENT_TYPE,
                        payload: {
                            jumpPolicy: result,
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
                handler.execute(<ModifyJumpPolicyCommand>{
                    transactionId: 'transaction-1',
                    displayName: 'jump-policy-1',
                }),
            ).rejects.toThrow('Error');
            expect(commandBusExecuteMethod).toHaveBeenCalled();
        });

        it('should throw an error if the jump policy retrieval from repository returns null', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const jumpPolicyEntityToBeCreated = { displayName: 'jump-policy-1', id: 123 } as JumpPolicyEntity;
            const jumpPolicyEntityCreateMethod = jest
                .spyOn(JumpPolicyEntity, 'create')
                .mockReturnValue(jumpPolicyEntityToBeCreated);
            const jumpPolicyRepositoryServiceCreateOrUpdateByIdMethod = jest.spyOn(
                jumpPolicyRepositoryService,
                'createOrUpdateById',
            );
            const jumpPolicyRepositoryServiceFindByIdMethod = jest
                .spyOn(jumpPolicyRepositoryService, 'findOneById')
                .mockResolvedValue(null);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<ModifyJumpPolicyCommand>{
                    transactionId: 'transaction-1',
                    displayName: 'jump-policy-1',
                    tenantId: 123,
                }),
            ).rejects.toThrow();
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(jumpPolicyEntityCreateMethod).toHaveBeenCalled();
            expect(jumpPolicyRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalled();
            expect(jumpPolicyRepositoryServiceFindByIdMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalled();
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: JumpPolicyModificationFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        jumpPolicy: jumpPolicyEntityToBeCreated,
                        tenantId: 123,
                    },
                }),
            );
        });

        it('should throw an error and publish an event if the repository service fails', async () => {
            // Arrange
            const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
            const jumpPolicyEntityToBeCreated = { displayName: 'jump-policy-1', id: 123 } as JumpPolicyEntity;
            const jumpPolicyEntityCreateMethod = jest
                .spyOn(JumpPolicyEntity, 'create')
                .mockReturnValue(jumpPolicyEntityToBeCreated);
            const expectedError = new Error('Error');
            const jumpPolicyRepositoryServiceCreateOrUpdateByIdMethod = jest
                .spyOn(jumpPolicyRepositoryService, 'createOrUpdateById')
                .mockRejectedValue(expectedError);
            const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
            const errorProcessorUtilityStringifyMethod = jest
                .spyOn(ErrorProcessorUtility, 'stringify')
                .mockReturnValue('expected-error-message');

            // Act & Assert
            await expect(
                handler.execute(<ModifyJumpPolicyCommand>{
                    transactionId: 'transaction-1',
                    displayName: 'jump-policy-1',
                    tenantId: 123,
                }),
            ).rejects.toThrow(expectedError);
            expect(commandBusExecuteMethod).toHaveBeenCalled();
            expect(jumpPolicyEntityCreateMethod).toHaveBeenCalled();
            expect(jumpPolicyRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalled();
            expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
            expect(eventBusPublishMethod).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-1',
                    eventType: JumpPolicyModificationFailedEvent.EVENT_TYPE,
                    payload: {
                        errorMessage: 'expected-error-message',
                        jumpPolicy: jumpPolicyEntityToBeCreated,
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
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedJumpPolicyModifiedDtoOutput);

    return commandBus;
}

function mockJumpPolicyRepositoryService() {
    const jumpPolicyRepositoryService = {} as JumpPolicyRepositoryService;
    jumpPolicyRepositoryService.createOrUpdateById = jest.fn();
    jumpPolicyRepositoryService.findOneById = jest.fn();

    return jumpPolicyRepositoryService;
}
