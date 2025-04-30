import { CommandBus, EventBus } from '@nestjs/cqrs';
import { DeleteUserCommand as BTDeleteUserCommand } from '../../../beyondtrust-pra-conf-api/user/commands';
import { UserDeletedEvent } from '../../events';
import { DeleteUserCommand } from '../delete-user.command';
import { DeleteUserCommandHandler } from './delete-user.command-handler';

describe('DeleteUserCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let handler: DeleteUserCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        handler = new DeleteUserCommandHandler(commandBus, eventBus);
    });

    it('should call the command bus with correct parameters and publish an event', async () => {
        const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
        const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

        await handler.execute(new DeleteUserCommand('transaction-1', 123));

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(new BTDeleteUserCommand('transaction-1', 123));
        expect(eventBusPublishMethod).toHaveBeenCalledWith(
            expect.objectContaining(<UserDeletedEvent>{
                transactionId: 'transaction-1',
                eventType: UserDeletedEvent.EVENT_TYPE,
                payload: {
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
