import { CommandBus, EventBus } from '@nestjs/cqrs';
import { CreateNodeCommand } from '../../../../service-manager-api/nodes/commands';
import { BusinessUnit, BusinessUnitFullName, HypervisorType } from '../../../../service-manager-api/nodes/enums';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { JumpointNodeBusinessUnit, JumpointNodeHypervisorType } from '../../enums';
import { JumpointNodeCreatedEvent, JumpointNodeCreationFailedEvent } from '../../events';
import { JumpointNode } from '../../models';
import { JumpointNodeEntity } from '../../repositories/entities';
import { JumpointNodeRepositoryService } from '../../repositories/services/jumpoint-node-repository.service';
import { CreateJumpointNodeCommand } from '../create-jumpoint-node.command';
import { CreateJumpointNodeCommandHandler } from './create-jumpoint-node.command-handler';

describe('CreateJumpointNodeCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let jumpointNodeRepositoryService: JumpointNodeRepositoryService;
    let handler: CreateJumpointNodeCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        jumpointNodeRepositoryService = mockJumpointNodeRepositoryService();
        handler = new CreateJumpointNodeCommandHandler(commandBus, eventBus, jumpointNodeRepositoryService);
    });

    it('should throw any error if the command bus throws one', async () => {
        const expectedError = new Error('Command bus error');
        const commandBusExecute = jest.spyOn(commandBus, 'execute').mockImplementation(() => {
            throw expectedError;
        });

        await expect(
            handler.execute(new CreateJumpointNodeCommand('transaction-1', 'site-1', JumpointNodeBusinessUnit.EG)),
        ).rejects.toThrow(expectedError);

        expect(commandBusExecute).toHaveBeenCalledWith(
            new CreateNodeCommand('transaction-1', 'site-1', BusinessUnit.EG, undefined, undefined, undefined),
        );
    });

    describe('optional hypervisor and VM fields (MARLINKPRA-30)', () => {
        it('should not inject placeholder values when the caller omits them', async () => {
            const commandBusExecute = jest.spyOn(commandBus, 'execute');

            await handler.execute(
                new CreateJumpointNodeCommand('transaction-1', 'site-1', JumpointNodeBusinessUnit.MT),
            );

            const sentCommand = (commandBusExecute.mock.calls[0] as unknown[])[0] as CreateNodeCommand;
            expect(sentCommand).toBeInstanceOf(CreateNodeCommand);
            expect(sentCommand.siteId).toBe('site-1');
            expect(sentCommand.businessUnit).toBe(BusinessUnit.MT);
            expect(sentCommand.hypervisorId).toBeUndefined();
            expect(sentCommand.hypervisorType).toBeUndefined();
            expect(sentCommand.vmId).toBeUndefined();
        });

        it.each([
            {
                hypervisorType: JumpointNodeHypervisorType.OneEdge,
                expectedSMHypervisorType: HypervisorType.OneEdge,
            },
            {
                hypervisorType: JumpointNodeHypervisorType.XCPower,
                expectedSMHypervisorType: HypervisorType.XCPower,
            },
        ])(
            'should pass provided values through and map hypervisor type $hypervisorType',
            async ({ hypervisorType, expectedSMHypervisorType }) => {
                const commandBusExecute = jest.spyOn(commandBus, 'execute');

                await handler.execute(
                    new CreateJumpointNodeCommand(
                        'transaction-1',
                        'site-1',
                        JumpointNodeBusinessUnit.OA,
                        'hypervisor-7',
                        hypervisorType,
                        42,
                    ),
                );

                expect(commandBusExecute).toHaveBeenCalledWith(
                    new CreateNodeCommand(
                        'transaction-1',
                        'site-1',
                        BusinessUnit.OA,
                        'hypervisor-7',
                        expectedSMHypervisorType,
                        42,
                    ),
                );
            },
        );

        it('should persist the hypervisor and VM values returned by the Service Manager', async () => {
            jest.spyOn(commandBus, 'execute').mockResolvedValue({
                certname: 'cert-1',
                businessUnit: BusinessUnitFullName.EEG,
                puppetServerDomain: 'puppet-server-domain-1',
                status: 'CREATED',
                siteId: 'site-1',
                hypervisorId: 'hypervisor-7',
                hypervisorType: HypervisorType.XCPower,
                vmId: 42,
            });
            const jumpointNodeRepositoryServiceCreateMethod = jest.spyOn(jumpointNodeRepositoryService, 'create');

            await handler.execute(
                new CreateJumpointNodeCommand(
                    'transaction-1',
                    'site-1',
                    JumpointNodeBusinessUnit.EG,
                    'hypervisor-7',
                    JumpointNodeHypervisorType.XCPower,
                    42,
                ),
            );

            expect(jumpointNodeRepositoryServiceCreateMethod).toHaveBeenCalledWith(
                JumpointNodeEntity.createWithoutId(
                    'cert-1',
                    JumpointNodeBusinessUnit.EG,
                    'site-1',
                    'CREATED',
                    'puppet-server-domain-1',
                    'hypervisor-7',
                    JumpointNodeHypervisorType.XCPower,
                    undefined,
                    42,
                    undefined,
                    undefined,
                    undefined,
                ),
            );
        });

        it('should reject an unknown hypervisor type before calling the Service Manager', async () => {
            const commandBusExecute = jest.spyOn(commandBus, 'execute');

            await expect(
                handler.execute(
                    new CreateJumpointNodeCommand(
                        'transaction-1',
                        'site-1',
                        JumpointNodeBusinessUnit.EG,
                        undefined,
                        'unknown' as JumpointNodeHypervisorType,
                    ),
                ),
            ).rejects.toThrow('Unknown JumpointNodeHypervisorType: unknown');

            expect(commandBusExecute).not.toHaveBeenCalled();
        });
    });

    it('should publish an error event and throw an error if the repository fails', async () => {
        const expectedError = new Error('Repository error');
        const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
        const jumpointNodeRepositoryServiceCreateMethod = jest
            .spyOn(jumpointNodeRepositoryService, 'create')
            .mockRejectedValue(expectedError);
        const errorProcessorUtilityStringifyMethod = jest
            .spyOn(ErrorProcessorUtility, 'stringify')
            .mockReturnValue('expected-error-message');

        await expect(
            handler.execute(new CreateJumpointNodeCommand('transaction-1', 'site-1', JumpointNodeBusinessUnit.EG)),
        ).rejects.toThrow(expectedError);

        expect(jumpointNodeRepositoryServiceCreateMethod).toHaveBeenCalledWith(
            JumpointNodeEntity.createWithoutId(
                'cert-1',
                JumpointNodeBusinessUnit.EG,
                'site-1',
                'CREATED',
                'puppet-server-domain-1',
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
            ),
        );
        expect(errorProcessorUtilityStringifyMethod).toHaveBeenCalledWith(expectedError);
        expect(eventBusPublishMethod).toHaveBeenCalledWith(
            expect.objectContaining({
                transactionId: 'transaction-1',
                eventType: JumpointNodeCreationFailedEvent.EVENT_TYPE,
                payload: {
                    businessUnit: JumpointNodeBusinessUnit.EG,
                    errorMessage: 'expected-error-message',
                    hypervisorId: undefined,
                    hypervisorType: undefined,
                    siteKey: 'site-1',
                    vmId: undefined,
                },
            }),
        );
    });

    it('should create data in db and publish an event', async () => {
        const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');
        const jumpointNodeRepositoryServiceCreateMethod = jest.spyOn(jumpointNodeRepositoryService, 'create');

        await handler.execute(new CreateJumpointNodeCommand('transaction-1', 'site-1', JumpointNodeBusinessUnit.EG));

        expect(jumpointNodeRepositoryServiceCreateMethod).toHaveBeenCalledWith(
            JumpointNodeEntity.createWithoutId(
                'cert-1',
                JumpointNodeBusinessUnit.EG,
                'site-1',
                'CREATED',
                'puppet-server-domain-1',
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
            ),
        );
        expect(eventBusPublishMethod).toHaveBeenCalledWith(
            expect.objectContaining(<JumpointNodeCreatedEvent>{
                transactionId: 'transaction-1',
                eventType: JumpointNodeCreatedEvent.EVENT_TYPE,
                payload: {
                    jumpointNode: {
                        id: 123,
                        certname: 'cert-1',
                        businessUnit: JumpointNodeBusinessUnit.EG,
                        siteKey: 'site-1',
                        puppetServerDomain: 'puppet-server-domain-1',
                        status: 'CREATED',
                    },
                },
            }),
        );
    });
});

function mockCommandBus() {
    const service = {} as CommandBus;
    service.execute = jest.fn().mockResolvedValue({
        certname: 'cert-1',
        businessUnit: BusinessUnitFullName.EEG,
        id: 123,
        puppetServerDomain: 'puppet-server-domain-1',
        status: 'CREATED',
        siteId: 'site-1',
    });

    return service;
}

function mockEventBus() {
    const service = {} as EventBus;
    service.publish = jest.fn().mockResolvedValue(Promise.resolve());

    return service;
}

function mockJumpointNodeRepositoryService(): JumpointNodeRepositoryService {
    const service = {} as JumpointNodeRepositoryService;
    service.create = jest.fn().mockResolvedValue({
        certname: 'cert-1',
        businessUnit: JumpointNodeBusinessUnit.EG,
        id: 123,
        puppetServerDomain: 'puppet-server-domain-1',
        status: 'CREATED',
        siteKey: 'site-1',
    } as JumpointNode);

    return service;
}
