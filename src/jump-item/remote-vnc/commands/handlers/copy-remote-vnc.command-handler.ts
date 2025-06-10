import { CommandBus, CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { CopyRemoteVncCommand as BTCopyRemoteVncCommand } from '../../../../beyondtrust-pra-conf-api/jump-item/remote-vnc/commands';
import {
    RemoteVncCopiedDtoOutput,
    RemoteVncRetrievedDtoOutput,
} from '../../../../beyondtrust-pra-conf-api/jump-item/remote-vnc/dtos/outputs';
import { RetrieveRemoteVncByIdQuery as BTRetrieveRemoteVncByIdQuery } from '../../../../beyondtrust-pra-conf-api/jump-item/remote-vnc/queries';
import { ErrorProcessorUtility } from '../../../../shared/utilities';
import { RemoteVncCopiedEvent, RemoteVncCopyFailedEvent } from '../../events';
import { mapFromBTJumpGroupType, mapToBTJumpGroupType } from '../../mappers';
import { RemoteVnc } from '../../models';
import { RemoteVncEntity } from '../../repositories/entities';
import { RemoteVncRepositoryService } from '../../repositories/services/remote-vnc-repository.service';
import { CopyRemoteVncCommand } from '../copy-remote-vnc.command';

@CommandHandler(CopyRemoteVncCommand)
export class CopyRemoteVncCommandHandler implements ICommandHandler<CopyRemoteVncCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly queryBus: QueryBus,
        private readonly remoteVncRepositoryService: RemoteVncRepositoryService,
    ) {}

    public async execute(command: CopyRemoteVncCommand): Promise<RemoteVnc> {
        const btRemoteVnc = await this.copyBTRemoteVnc(command);
        const remoteVncEntity = this.createRemoteVncEntity(btRemoteVnc);

        try {
            const createdRemoteVnc = await this.remoteVncRepositoryService.create(remoteVncEntity);

            this.eventBus.publish(
                new RemoteVncCopiedEvent(command.transactionId, {
                    remoteVnc: createdRemoteVnc,
                }),
            );

            return createdRemoteVnc;
        } catch (error) {
            this.eventBus.publish(
                new RemoteVncCopyFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    remoteVnc: remoteVncEntity,
                }),
            );

            throw error;
        }
    }

    private async copyBTRemoteVnc(command: CopyRemoteVncCommand) {
        const response = await this.commandBus.execute<BTCopyRemoteVncCommand, RemoteVncCopiedDtoOutput>(
            new BTCopyRemoteVncCommand(
                command.transactionId,
                command.id,
                command.jumpGroupId,
                mapToBTJumpGroupType(command.jumpGroupType),
                command.name,
            ),
        );

        return await this.queryBus.execute<BTRetrieveRemoteVncByIdQuery, RemoteVncRetrievedDtoOutput>(
            new BTRetrieveRemoteVncByIdQuery(command.transactionId, response.destId),
        );
    }

    private createRemoteVncEntity(btRemoteVnc: RemoteVncRetrievedDtoOutput) {
        return RemoteVncEntity.create(
            btRemoteVnc.id,
            btRemoteVnc.name,
            btRemoteVnc.jumpointId,
            btRemoteVnc.hostname,
            btRemoteVnc.port,
            btRemoteVnc.jumpGroupId,
            btRemoteVnc.jumpGroupType ? mapFromBTJumpGroupType(btRemoteVnc.jumpGroupType) : undefined,
            btRemoteVnc.tag,
            btRemoteVnc.comments,
            btRemoteVnc.jumpPolicyId,
            btRemoteVnc.sessionPolicyId,
        );
    }
}
