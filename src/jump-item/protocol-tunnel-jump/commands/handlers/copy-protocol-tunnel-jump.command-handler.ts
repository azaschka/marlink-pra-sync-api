import { CommandBus, CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { CopyProtocolTunnelJumpCommand as BTCopyProtocolTunnelJumpCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/protocol-tunnel-jump/commands';
import {
    ProtocolTunnelJumpCopiedDtoOutput,
    ProtocolTunnelJumpRetrievedDtoOutput,
} from '../../../../beyondtrust-pra-conf-api/jump-item/protocol-tunnel-jump/dtos/outputs';
import { RetrieveProtocolTunnelJumpByIdQuery as BTRetrieveProtocolTunnelJumpByIdQuery } from '../../../../beyondtrust-pra-conf-api/jump-item/protocol-tunnel-jump/queries';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { ProtocolTunnelJumpCopiedEvent, ProtocolTunnelJumpCopyFailedEvent } from '../../events';
import { mapFromBTJumpGroupType, mapFromBTTunnelType, mapToBTJumpGroupType } from '../../mappers';
import { ProtocolTunnelJump } from '../../models';
import { ProtocolTunnelJumpEntity } from '../../repositories/entities';
import { ProtocolTunnelJumpRepositoryService } from '../../repositories/services/protocol-tunnel-jump-repository.service';
import { CopyProtocolTunnelJumpCommand } from '../copy-protocol-tunnel-jump.command';

@CommandHandler(CopyProtocolTunnelJumpCommand)
export class CopyProtocolTunnelJumpCommandHandler implements ICommandHandler<CopyProtocolTunnelJumpCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly queryBus: QueryBus,
        private readonly protocolTunnelJumpRepositoryService: ProtocolTunnelJumpRepositoryService,
    ) {}

    public async execute(command: CopyProtocolTunnelJumpCommand): Promise<ProtocolTunnelJump> {
        const btProtocolTunnelJump = await this.copyBTProtocolTunnelJump(command);
        const protocolTunnelJumpEntity = this.createProtocolTunnelJumpEntity(btProtocolTunnelJump);

        try {
            const createdProtocolTunnelJump = await this.protocolTunnelJumpRepositoryService.create(
                command.tenantId,
                protocolTunnelJumpEntity,
            );

            this.eventBus.publish(
                new ProtocolTunnelJumpCopiedEvent(command.transactionId, {
                    protocolTunnelJump: createdProtocolTunnelJump,
                }),
            );

            return createdProtocolTunnelJump;
        } catch (error) {
            this.eventBus.publish(
                new ProtocolTunnelJumpCopyFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    protocolTunnelJump: protocolTunnelJumpEntity,
                }),
            );

            throw error;
        }
    }

    private async copyBTProtocolTunnelJump(command: CopyProtocolTunnelJumpCommand) {
        const response = await this.commandBus.execute<
            BTCopyProtocolTunnelJumpCommand,
            ProtocolTunnelJumpCopiedDtoOutput
        >(
            new BTCopyProtocolTunnelJumpCommand(
                command.transactionId,
                command.id,
                command.jumpGroupId,
                mapToBTJumpGroupType(command.jumpGroupType),
                command.name,
            ),
        );

        return await this.queryBus.execute<BTRetrieveProtocolTunnelJumpByIdQuery, ProtocolTunnelJumpRetrievedDtoOutput>(
            new BTRetrieveProtocolTunnelJumpByIdQuery(command.transactionId, response.destId),
        );
    }

    private createProtocolTunnelJumpEntity(btProtocolTunnelJump: ProtocolTunnelJumpRetrievedDtoOutput) {
        return ProtocolTunnelJumpEntity.create(
            btProtocolTunnelJump.id,
            btProtocolTunnelJump.name,
            btProtocolTunnelJump.jumpointId,
            btProtocolTunnelJump.hostname,
            btProtocolTunnelJump.jumpGroupId,
            btProtocolTunnelJump.jumpGroupType ? mapFromBTJumpGroupType(btProtocolTunnelJump.jumpGroupType) : undefined,
            btProtocolTunnelJump.tag,
            btProtocolTunnelJump.comments,
            btProtocolTunnelJump.jumpPolicyId,
            btProtocolTunnelJump.sessionPolicyId,
            btProtocolTunnelJump.tunnelListenAddress,
            btProtocolTunnelJump.tunnelDefinitions,
            btProtocolTunnelJump.tunnelType ? mapFromBTTunnelType(btProtocolTunnelJump.tunnelType) : undefined,
            btProtocolTunnelJump.username,
            btProtocolTunnelJump.database,
            btProtocolTunnelJump.url,
            btProtocolTunnelJump.caCertificates,
        );
    }
}
