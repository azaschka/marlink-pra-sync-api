import { NotFoundException } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { ApproveNodeCommand } from '../../../../service-manager-api/nodes/commands';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { JumpointNodeBusinessUnit } from '../../enums';
import { JumpointNodeApprovalFailedEvent, JumpointNodeApprovedEvent } from '../../events';
import { JumpointNode } from '../../models';
import { JumpointNodeRepositoryService } from '../../repositories/services/jumpoint-node-repository.service';
import { ApproveJumpointNodeCommand } from '../approve-jumpoint-node.command';
import { ApproveJumpointNodeCommandHandler } from './approve-jumpoint-node.command-handler';

describe('ApproveJumpointNodeCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let jumpointNodeRepositoryService: JumpointNodeRepositoryService;
    let handler: ApproveJumpointNodeCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        jumpointNodeRepositoryService = mockJumpointNodeRepositoryService();
        handler = new ApproveJumpointNodeCommandHandler(commandBus, eventBus, jumpointNodeRepositoryService);
    });

    it('should throw NotFoundException if the jumpoint node does not exist', async () => {
        jest.spyOn(jumpointNodeRepositoryService, 'findOneById').mockResolvedValue(null);

        await expect(handler.execute(new ApproveJumpointNodeCommand('transaction-1', 123))).rejects.toThrow(
            NotFoundException,
        );
    });

    it('should throw any error if the command bus throws one', async () => {
        const expectedError = new Error('Command bus error');
        const commandBusExecute = jest.spyOn(commandBus, 'execute').mockImplementation(() => {
            throw expectedError;
        });

        await expect(handler.execute(new ApproveJumpointNodeCommand('transaction-1', 123))).rejects.toThrow(
            expectedError,
        );

        expect(commandBusExecute).toHaveBeenCalledWith(new ApproveNodeCommand('transaction-1', 'cert-1'));
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

        await expect(handler.execute(new ApproveJumpointNodeCommand('transaction-1', 123))).rejects.toThrow(
            expectedError,
        );

        expect(jumpointNodeRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalledWith({
            certname: 'cert-1',
            businessUnit: JumpointNodeBusinessUnit.EG,
            id: 123,
            puppetServerDomain: 'puppet-server-domain-1',
            hasApproval: true,
        });
        expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
        expect(eventBusPublishMethod).toHaveBeenCalledWith(
            expect.objectContaining({
                transactionId: 'transaction-1',
                eventType: JumpointNodeApprovalFailedEvent.EVENT_TYPE,
                payload: {
                    errorMessage: 'expected-error-message',
                    id: 123,
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
        };

        await handler.execute(new ApproveJumpointNodeCommand('transaction-1', 123));

        expect(jumpointNodeRepositoryServiceCreateOrUpdateByIdMethod).toHaveBeenCalledWith(jumpointNode);
        expect(eventBusPublishMethod).toHaveBeenCalledWith(
            expect.objectContaining(<JumpointNodeApprovedEvent>{
                transactionId: 'transaction-1',
                eventType: JumpointNodeApprovedEvent.EVENT_TYPE,
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
        hasApproval: false,
    } as JumpointNode);

    return service;
}
