import { NotFoundException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { BeyondtrustInstanceModifiedEvent } from '../../events';
import { BeyondtrustInstance } from '../../models';
import { BeyondtrustInstanceEntity } from '../../repositories/entities';
import { BeyondtrustInstanceRepositoryService } from '../../repositories/services/beyondtrust-instance-repository.service';
import { ModifyBeyondtrustInstanceCommand } from '../modify-beyondtrust-instance.command';

@CommandHandler(ModifyBeyondtrustInstanceCommand)
export class ModifyBeyondtrustInstanceCommandHandler implements ICommandHandler<ModifyBeyondtrustInstanceCommand> {
    constructor(
        private readonly eventBus: EventBus,
        private readonly beyondtrustInstanceRepositoryService: BeyondtrustInstanceRepositoryService,
    ) {}

    public async execute(command: ModifyBeyondtrustInstanceCommand): Promise<BeyondtrustInstance> {
        const beyondTrustInstanceEntity = await this.beyondtrustInstanceRepositoryService.findOneById(command.id);

        if (!beyondTrustInstanceEntity) {
            throw new NotFoundException();
        }

        const modifiedBeyondTrustInstanceEntity = BeyondtrustInstanceEntity.create(
            command.id,
            command.name ?? beyondTrustInstanceEntity.name,
            command.authClientId ?? beyondTrustInstanceEntity.authClientId,
            command.authClientSecret ?? beyondTrustInstanceEntity.authClientSecret,
            command.oauth2TokenUrl ?? beyondTrustInstanceEntity.oauth2TokenUrl,
            command.apiBaseUrl ?? beyondTrustInstanceEntity.apiBaseUrl,
            command.billingType ?? beyondTrustInstanceEntity.billingType,
        );

        await this.beyondtrustInstanceRepositoryService.createOrUpdateById(modifiedBeyondTrustInstanceEntity);

        this.eventBus.publish(
            new BeyondtrustInstanceModifiedEvent(command.transactionId, {
                beyondtrustInstance: modifiedBeyondTrustInstanceEntity,
            }),
        );

        return modifiedBeyondTrustInstanceEntity;
    }
}
