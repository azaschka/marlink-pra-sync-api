import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ModifyJumpointCommand as BTModifyJumpointCommand } from '../../../beyondtrust-pra-conf-api/jumpoint/commands';
import { JumpointModifiedDtoOutput } from '../../../beyondtrust-pra-conf-api/jumpoint/dtos/outputs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpointModificationFailedEvent, JumpointModifiedEvent } from '../../events';
import {
    mapFromBTJumpointPlatformType,
    mapFromBTJzpClientAddressRestrictionsType,
    mapToBTJzpClientAddressRestrictionsType,
} from '../../mappers';
import { Jumpoint } from '../../models';
import { JumpointEntity } from '../../repositories/entities';
import { JumpointRepositoryService } from '../../repositories/services/jumpoint-repository.service';
import { ModifyJumpointCommand } from '../modify-jumpoint.command';

@CommandHandler(ModifyJumpointCommand)
export class ModifyJumpointCommandHandler implements ICommandHandler<ModifyJumpointCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly jumpointRepositoryService: JumpointRepositoryService,
    ) {}

    public async execute(command: ModifyJumpointCommand): Promise<Jumpoint> {
        const btJumpoint = await this.modifyBTJumpoint(command);
        const jumpointEntity = this.createJumpointEntity(btJumpoint);

        try {
            const updatedJumpoint = await this.updateJumpoint(command.tenantId, jumpointEntity);

            this.eventBus.publish(
                new JumpointModifiedEvent(command.transactionId, {
                    jumpoint: updatedJumpoint,
                    tenantId: command.tenantId,
                }),
            );

            return updatedJumpoint;
        } catch (error) {
            this.eventBus.publish(
                new JumpointModificationFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    jumpoint: jumpointEntity,
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }

    private async modifyBTJumpoint(command: ModifyJumpointCommand) {
        return await this.commandBus.execute<BTModifyJumpointCommand, JumpointModifiedDtoOutput>(
            new BTModifyJumpointCommand(
                command.transactionId,
                command.id,
                command.name,
                command.codeName,
                command.comments,
                command.isEnabled,
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

    private createJumpointEntity(btJumpoint: JumpointModifiedDtoOutput) {
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

    private async updateJumpoint(tenantId: number, jumpointEntity: JumpointEntity) {
        await this.jumpointRepositoryService.createOrUpdateById(tenantId, jumpointEntity);

        const createdOrUpdatedJumpoint = await this.jumpointRepositoryService.findOneById(tenantId, jumpointEntity.id);

        if (!createdOrUpdatedJumpoint) {
            throw new Error('Jumpoint has been created or updated but could not be retrieved.');
        }

        return createdOrUpdatedJumpoint;
    }
}
