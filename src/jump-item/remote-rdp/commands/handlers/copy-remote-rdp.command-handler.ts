import { CommandBus, CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { CopyRemoteRdpCommand as BTCopyRemoteRdpCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/remote-rdp/commands';
import {
    RemoteRdpCopiedDtoOutput,
    RemoteRdpRetrievedDtoOutput,
} from '../../../../beyondtrust-pra-conf-api/jump-item/remote-rdp/dtos/outputs';
import { RetrieveRemoteRdpByIdQuery as BTRetrieveRemoteRdpByIdQuery } from '../../../../beyondtrust-pra-conf-api/jump-item/remote-rdp/queries';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { RemoteRdpCopiedEvent, RemoteRdpCopyFailedEvent } from '../../events';
import {
    mapFromBTJumpGroupType,
    mapFromBTRdpQualityMode,
    mapFromBTSecureAppType,
    mapToBTJumpGroupType,
} from '../../mappers';
import { RemoteRdp } from '../../models';
import { RemoteRdpEntity } from '../../repositories/entities';
import { RemoteRdpRepositoryService } from '../../repositories/services/remote-rdp-repository.service';
import { CopyRemoteRdpCommand } from '../copy-remote-rdp.command';

@CommandHandler(CopyRemoteRdpCommand)
export class CopyRemoteRdpCommandHandler implements ICommandHandler<CopyRemoteRdpCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly queryBus: QueryBus,
        private readonly remoteRdpRepositoryService: RemoteRdpRepositoryService,
    ) {}

    public async execute(command: CopyRemoteRdpCommand): Promise<RemoteRdp> {
        const btRemoteRdp = await this.copyBTRemoteRdp(command);
        const remoteRdpEntity = this.createRemoteRdpEntity(btRemoteRdp);

        try {
            const createdRemoteRdp = await this.remoteRdpRepositoryService.create(command.tenantId, remoteRdpEntity);

            this.eventBus.publish(
                new RemoteRdpCopiedEvent(command.transactionId, {
                    remoteRdp: createdRemoteRdp,
                    tenantId: command.tenantId,
                }),
            );

            return createdRemoteRdp;
        } catch (error) {
            this.eventBus.publish(
                new RemoteRdpCopyFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    remoteRdp: remoteRdpEntity,
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }

    private async copyBTRemoteRdp(command: CopyRemoteRdpCommand) {
        const response = await this.commandBus.execute<BTCopyRemoteRdpCommand, RemoteRdpCopiedDtoOutput>(
            new BTCopyRemoteRdpCommand(
                command.transactionId,
                command.id,
                command.jumpGroupId,
                mapToBTJumpGroupType(command.jumpGroupType),
                command.name,
            ),
        );

        return await this.queryBus.execute<BTRetrieveRemoteRdpByIdQuery, RemoteRdpRetrievedDtoOutput>(
            new BTRetrieveRemoteRdpByIdQuery(command.transactionId, response.destId),
        );
    }

    private createRemoteRdpEntity(btRemoteRdp: RemoteRdpRetrievedDtoOutput) {
        return RemoteRdpEntity.create(
            btRemoteRdp.id,
            btRemoteRdp.name,
            btRemoteRdp.jumpointId,
            btRemoteRdp.hostname,
            btRemoteRdp.jumpGroupId,
            btRemoteRdp.jumpGroupType ? mapFromBTJumpGroupType(btRemoteRdp.jumpGroupType) : undefined,
            btRemoteRdp.quality ? mapFromBTRdpQualityMode(btRemoteRdp.quality) : undefined,
            btRemoteRdp.console,
            btRemoteRdp.ignoreUntrusted,
            btRemoteRdp.tag,
            btRemoteRdp.comments,
            btRemoteRdp.rdpUsername,
            btRemoteRdp.domain,
            btRemoteRdp.jumpPolicyId,
            btRemoteRdp.sessionForensics,
            btRemoteRdp.sessionPolicyId,
            btRemoteRdp.endpointId,
            btRemoteRdp.secureAppType ? mapFromBTSecureAppType(btRemoteRdp.secureAppType) : undefined,
            btRemoteRdp.remoteAppName,
            btRemoteRdp.remoteAppParams,
            btRemoteRdp.remoteExePath,
            btRemoteRdp.remoteExeParams,
            btRemoteRdp.targetSystem,
            btRemoteRdp.credentialType,
        );
    }
}
