import { CommandBus, EventBus } from '@nestjs/cqrs';
import { DeleteGroupPolicyCommand as BTDeleteGroupPolicyCommand } from '../../../beyondtrust-pra-conf-api/group-policy/commands';
import { GroupPolicyDeletedEvent } from '../../events';
import { DeleteGroupPolicyCommand } from '../delete-group-policy.command';
import { DeleteGroupPolicyCommandHandler } from './delete-group-policy.command-handler';

describe('DeleteGroupPolicyCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let handler: DeleteGroupPolicyCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        handler = new DeleteGroupPolicyCommandHandler(commandBus, eventBus);
    });

    it('should call the command bus with correct parameters and publish an event', async () => {
        const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
        const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

        await handler.execute(new DeleteGroupPolicyCommand('transaction-1', 123));

        expect(commandBusExecuteMethod).toHaveBeenCalledWith(new BTDeleteGroupPolicyCommand('transaction-1', 123));
        expect(eventBusPublishMethod).toHaveBeenCalledWith(
            expect.objectContaining(<GroupPolicyDeletedEvent>{
                transactionId: 'transaction-1',
                eventType: GroupPolicyDeletedEvent.EVENT_TYPE,
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
