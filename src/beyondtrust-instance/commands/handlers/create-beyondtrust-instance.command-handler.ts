import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { BeyondtrustInstanceCreatedEvent } from '../../events';
import { BeyondtrustInstance } from '../../models';
import { BeyondtrustInstanceEntity } from '../../repositories/entities';
import { BeyondtrustInstanceRepositoryService } from '../../repositories/services/beyondtrust-instance-repository.service';
import { CreateBeyondtrustInstanceCommand } from '../create-beyondtrust-instance.command';

@CommandHandler(CreateBeyondtrustInstanceCommand)
export class CreateBeyondtrustInstanceCommandHandler implements ICommandHandler<CreateBeyondtrustInstanceCommand> {
    constructor(
        private readonly eventBus: EventBus,
        private readonly beyondtrustInstanceRepositoryService: BeyondtrustInstanceRepositoryService,
    ) {}

    public async execute(command: CreateBeyondtrustInstanceCommand): Promise<BeyondtrustInstance> {
        const beyondTrustInstanceEntity = BeyondtrustInstanceEntity.createWithoutId(
            command.name,
            command.authClientId,
            command.authClientSecret,
            command.oauth2TokenUrl,
            command.apiBaseUrl,
            command.billingType,
            command.businessUnit,
        );
        const createdBeyondtrustInstance =
            await this.beyondtrustInstanceRepositoryService.create(beyondTrustInstanceEntity);

        this.eventBus.publish(
            new BeyondtrustInstanceCreatedEvent(command.transactionId, {
                beyondtrustInstance: createdBeyondtrustInstance,
            }),
        );

        return createdBeyondtrustInstance;
    }
}
