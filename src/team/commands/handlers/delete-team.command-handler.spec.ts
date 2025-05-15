import { CommandBus, EventBus } from '@nestjs/cqrs';
import { DeleteTeamCommand as BTDeleteTeamCommand } from '../../../beyondtrust-pra-conf-api/team/commands';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { TeamDeletedEvent, TeamDeletionFailedEvent } from '../../events';
import { TeamRepositoryService } from '../../repositories/services/team-repository.service';
import { DeleteTeamCommand } from '../delete-team.command';
import { DeleteTeamCommandHandler } from './delete-team.command-handler';

describe('DeleteTeamCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let teamRepositoryService: TeamRepositoryService;
    let handler: DeleteTeamCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        teamRepositoryService = mockTeamRepositoryService();
        handler = new DeleteTeamCommandHandler(commandBus, eventBus, teamRepositoryService);
    });

    it('should call the command bus with correct parameters, delete data from db and publish an event', async () => {
        const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
        const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
        const teamRepositoryServiceDeleteByIdMethod = jest.spyOn(teamRepositoryService, 'deleteById');

        await handler.execute(new DeleteTeamCommand('transaction-1', 123));

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(new BTDeleteTeamCommand('transaction-1', 123));
        expect(teamRepositoryServiceDeleteByIdMethod).toHaveBeenCalledWith(123);
        expect(eventBusPublishMethod).toHaveBeenCalledWith(
            expect.objectContaining(<TeamDeletedEvent>{
                transactionId: 'transaction-1',
                eventType: TeamDeletedEvent.EVENT_TYPE,
                payload: {
                    id: 123,
                },
            }),
        );
    });

    it('should throw an error if the command bus fails', async () => {
        const expectedError = new Error('Command bus error');
        const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute').mockRejectedValue(expectedError);
        const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
        const teamRepositoryServiceDeleteByIdMethod = jest.spyOn(teamRepositoryService, 'deleteById');

        await expect(handler.execute(new DeleteTeamCommand('transaction-1', 123))).rejects.toThrow(expectedError);

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(new BTDeleteTeamCommand('transaction-1', 123));
        expect(teamRepositoryServiceDeleteByIdMethod).not.toHaveBeenCalled();
        expect(eventBusPublishMethod).not.toHaveBeenCalled();
    });

    it('should publish an error event and throw an error if the repository fails', async () => {
        const expectedError = new Error('Repository error');
        const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
        const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
        const teamRepositoryServiceDeleteByIdMethod = jest
            .spyOn(teamRepositoryService, 'deleteById')
            .mockRejectedValue(expectedError);
        const errorProcessorUtilityStringifyMethod = jest
            .spyOn(ErrorProcessorUtility, 'stringify')
            .mockReturnValue('expected-error-message');

        await expect(handler.execute(new DeleteTeamCommand('transaction-1', 123))).rejects.toThrow(expectedError);

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(new BTDeleteTeamCommand('transaction-1', 123));
        expect(teamRepositoryServiceDeleteByIdMethod).toHaveBeenCalledWith(123);
        expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
        expect(eventBusPublishMethod).toHaveBeenCalledWith(
            expect.objectContaining({
                transactionId: 'transaction-1',
                eventType: TeamDeletionFailedEvent.EVENT_TYPE,
                payload: {
                    errorMessage: 'expected-error-message',
                    id: 123,
                },
            }),
        );
    });
});

function mockCommandBus() {
    const service = {} as CommandBus;
    service.execute = jest.fn().mockResolvedValue(Promise.resolve());

    return service;
}

function mockEventBus() {
    const service = {} as EventBus;
    service.publish = jest.fn().mockResolvedValue(Promise.resolve());

    return service;
}

function mockTeamRepositoryService(): TeamRepositoryService {
    const service = {} as TeamRepositoryService;
    service.deleteById = jest.fn().mockReturnValue(Promise.resolve());

    return service;
}
