import { NotFoundException } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { CreateNodeServiceCommand } from '../../../../service-manager-api/nodes/commands';
import { NodeServiceType } from '../../../../service-manager-api/nodes/enums';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { JumpointNodeBusinessUnit, JumpointNodeServiceType } from '../../enums';
import { JumpointNodeServiceCreatedEvent, JumpointNodeServiceCreationFailedEvent } from '../../events';
import { JumpointNode } from '../../models';
import { JumpointNodeRepositoryService } from '../../repositories/services/jumpoint-node-repository.service';
import { CreateJumpointNodeServiceCommand } from '../create-jumpoint-node-service.command';
import { CreateJumpointNodeServiceCommandHandler } from './create-jumpoint-node-service.command-handler';

describe('CreateJumpointNodeServiceCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let jumpointNodeRepositoryService: JumpointNodeRepositoryService;
    let handler: CreateJumpointNodeServiceCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        jumpointNodeRepositoryService = mockJumpointNodeRepositoryService();
        handler = new CreateJumpointNodeServiceCommandHandler(commandBus, eventBus, jumpointNodeRepositoryService);
    });

    it('should throw NotFoundException if the jumpoint node does not exist', async () => {
        jest.spyOn(jumpointNodeRepositoryService, 'findOneById').mockResolvedValue(null);

        await expect(
            handler.execute(new CreateJumpointNodeServiceCommand('transaction-1', 123, JumpointNodeServiceType.Pra)),
        ).rejects.toThrow(NotFoundException);
    });

    it('should throw any error if the command bus throws one', async () => {
        const expectedError = new Error('Command bus error');
        const commandBusExecute = jest.spyOn(commandBus, 'execute').mockImplementation(() => {
            throw expectedError;
        });

        await expect(
            handler.execute(new CreateJumpointNodeServiceCommand('transaction-1', 123, JumpointNodeServiceType.Pra)),
        ).rejects.toThrow(expectedError);

        expect(commandBusExecute).toHaveBeenCalledWith(
            new CreateNodeServiceCommand('transaction-1', 'cert-1', NodeServiceType.Pra),
        );
    });

    it('should publish an error event and throw an error if the repository fails', async () => {
        const expectedError = new Error('Repository error');
        const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
        const jumpointNodeRepositoryServiceCreateOrUpdateByIdMethod = jest
            .spyOn(jumpointNodeRepositoryService, 'createOrUpdateById')
            .mockRejectedValue(expectedError);
        const errorProcessorUtilityStringifyMethod = jest
            .spyOn(ErrorProcessorUtility, 'stringify')
            .mockReturnValue('expected-error-message');

        await expect(
            handler.execute(new CreateJumpointNodeServiceCommand('transaction-1', 123, JumpointNodeServiceType.Pra)),
        ).rejects.toThrow(expectedError);

        expect(jumpointNodeRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalledWith({
            certname: 'cert-1',
            businessUnit: JumpointNodeBusinessUnit.EG,
            id: 123,
            puppetServerDomain: 'puppet-server-domain-1',
            hasApproval: true,
            serviceType: JumpointNodeServiceType.Pra,
        });
        expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
        expect(eventBusPublishMethod).toHaveBeenCalledWith(
            expect.objectContaining({
                transactionId: 'transaction-1',
                eventType: JumpointNodeServiceCreationFailedEvent.EVENT_TYPE,
                payload: {
                    errorMessage: 'expected-error-message',
                    id: 123,
                    serviceType: JumpointNodeServiceType.Pra,
                },
            }),
        );
    });

    it('should update data in db and publish an event', async () => {
        const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
        const jumpointNodeRepositoryServiceCreateOrUpdateByIdMethod = jest.spyOn(
            jumpointNodeRepositoryService,
            'createOrUpdateById',
        );
        const jumpointNode = {
            certname: 'cert-1',
            businessUnit: JumpointNodeBusinessUnit.EG,
            id: 123,
            puppetServerDomain: 'puppet-server-domain-1',
            hasApproval: true,
            serviceType: JumpointNodeServiceType.Pra,
        };

        await handler.execute(new CreateJumpointNodeServiceCommand('transaction-1', 123, JumpointNodeServiceType.Pra));

        expect(jumpointNodeRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalledWith(jumpointNode);
        expect(eventBusPublishMethod).toHaveBeenCalledWith(
            expect.objectContaining(<JumpointNodeServiceCreatedEvent>{
                transactionId: 'transaction-1',
                eventType: JumpointNodeServiceCreatedEvent.EVENT_TYPE,
                payload: {
                    jumpointNode: jumpointNode,
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

function mockJumpointNodeRepositoryService(): JumpointNodeRepositoryService {
    const service = {} as JumpointNodeRepositoryService;
    service.createOrUpdateById = jest.fn().mockReturnValue(Promise.resolve());
    service.findOneById = jest.fn().mockResolvedValue({
        certname: 'cert-1',
        businessUnit: JumpointNodeBusinessUnit.EG,
        id: 123,
        puppetServerDomain: 'puppet-server-domain-1',
        hasApproval: true,
        serviceType: undefined,
    } as JumpointNode);

    return service;
}
