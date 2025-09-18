import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateJumpointCommand as BTCreateJumpointCommand } from '../../../beyondtrust-pra-conf-api/jumpoint/commands';
import { JumpointCreatedDtoOutput } from '../../../beyondtrust-pra-conf-api/jumpoint/dtos/outputs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpointCreatedEvent, JumpointCreationFailedEvent } from '../../events';
import {
    mapFromBTJumpointPlatformType,
    mapFromBTJzpClientAddressRestrictionsType,
    mapToBTJumpointPlatformType,
    mapToBTJzpClientAddressRestrictionsType,
} from '../../mappers';
import { Jumpoint } from '../../models';
import { JumpointEntity } from '../../repositories/entities';
import { JumpointRepositoryService } from '../../repositories/services/jumpoint-repository.service';
import { CreateJumpointCommand } from '../create-jumpoint.command';

@CommandHandler(CreateJumpointCommand)
export class CreateJumpointCommandHandler implements ICommandHandler<CreateJumpointCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly jumpointRepositoryService: JumpointRepositoryService,
    ) {}

    public async execute(command: CreateJumpointCommand): Promise<Jumpoint> {
        const btJumpoint = await this.createBTJumpoint(command);
        const jumpointEntity = this.createJumpointEntity(btJumpoint);

        try {
            const createdJumpoint = await this.jumpointRepositoryService.create(command.tenantId, jumpointEntity);

            this.eventBus.publish(
                new JumpointCreatedEvent(command.transactionId, {
                    jumpoint: createdJumpoint,
                }),
            );

            return createdJumpoint;
        } catch (error) {
            this.eventBus.publish(
                new JumpointCreationFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    jumpoint: jumpointEntity,
                }),
            );

            throw error;
        }
    }

    private async createBTJumpoint(command: CreateJumpointCommand) {
        return await this.commandBus.execute<BTCreateJumpointCommand, JumpointCreatedDtoOutput>(
            new BTCreateJumpointCommand(
                command.transactionId,
                command.name,
                mapToBTJumpointPlatformType(command.platformType),
                command.codeName,
                command.comments,
                command.isEnabled,
                command.isClustered,
                command.isShellJumpEnabled,
                command.externalJumpItemNetworkId,
                command.isProtocolTunnelEnabled,
                command.rdpServiceAccountId,
                command.managedIpRanges,
                command.isJzpEnabled,
                command.jzpProxyHostname,
                command.jzpProxyPort,
                command.isJzpHttpGetAllowed,
                command.jzpClientAddressRestrictionsType
                    ? mapToBTJzpClientAddressRestrictionsType(command.jzpClientAddressRestrictionsType)
                    : undefined,
                command.jzpRestrictedIps,
            ),
        );
    }

    private createJumpointEntity(btJumpoint: JumpointCreatedDtoOutput) {
        return JumpointEntity.create(
            btJumpoint.id,
            btJumpoint.name,
            mapFromBTJumpointPlatformType(btJumpoint.platform),
            btJumpoint.codeName,
            btJumpoint.comments,
            btJumpoint.enabled,
            btJumpoint.connected,
            btJumpoint.clustered,
            btJumpoint.shellJumpEnabled,
            btJumpoint.externalJumpItemNetworkId,
            btJumpoint.protocolTunnelEnabled,
            btJumpoint.rdpServiceAccountId,
            btJumpoint.managedIpRanges,
            btJumpoint.jzpEnabled,
            btJumpoint.jzpProxyHostname,
            btJumpoint.jzpProxyPort,
            btJumpoint.jzpAllowHttpGet,
            btJumpoint.jzpClientAddressRestrictionsType
                ? mapFromBTJzpClientAddressRestrictionsType(btJumpoint.jzpClientAddressRestrictionsType)
                : undefined,
            btJumpoint.jzpRestrictedIps,
            btJumpoint.dockerDeployKey,
            btJumpoint.keyInfo,
        );
    }
}
