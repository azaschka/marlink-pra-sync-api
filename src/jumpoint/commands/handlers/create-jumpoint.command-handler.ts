import { CommandBus, CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { CreateJumpointCommand as BTCreateJumpointCommand } from '../../../beyondtrust-pra-conf-api/jumpoint/commands';
import {
    JumpointCreatedDtoOutput,
    JumpointRetrievedDtoOutput,
} from '../../../beyondtrust-pra-conf-api/jumpoint/dtos/outputs';
import { RetrieveJumpointsQuery as BTRetrieveJumpointsQuery } from '../../../beyondtrust-pra-conf-api/jumpoint/queries';
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
        private readonly queryBus: QueryBus,
        private readonly eventBus: EventBus,
        private readonly jumpointRepositoryService: JumpointRepositoryService,
    ) {}

    public async execute(command: CreateJumpointCommand): Promise<Jumpoint> {
        const { btJumpoint, existedInBeyondTrust } = await this.getOrCreateBTJumpoint(command);
        const jumpointEntity = this.createJumpointEntity(btJumpoint);

        try {
            let savedJumpoint: Jumpoint;

            if (existedInBeyondTrust) {
                // Jumpoint already existed in BeyondTrust but was missing from the local sync DB.
                // Use upsert to heal the sync DB and avoid a duplicate-key error.
                await this.jumpointRepositoryService.createOrUpdateById(command.tenantId, jumpointEntity);
                savedJumpoint = jumpointEntity;
            } else {
                savedJumpoint = await this.jumpointRepositoryService.create(command.tenantId, jumpointEntity);
            }

            this.eventBus.publish(
                new JumpointCreatedEvent(command.transactionId, {
                    jumpoint: savedJumpoint,
                    tenantId: command.tenantId,
                }),
            );

            return savedJumpoint;
        } catch (error) {
            this.eventBus.publish(
                new JumpointCreationFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    jumpoint: jumpointEntity,
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }

    /**
     * Attempts to create the jumpoint in BeyondTrust.
     * If BeyondTrust rejects with 422 "already been taken", the existing jumpoint is fetched instead.
     * This ensures true idempotency even when the local sync DB is out of sync with BeyondTrust
     * (e.g. after a DB reset or before the first discrepancy scan has run).
     */
    private async getOrCreateBTJumpoint(
        command: CreateJumpointCommand,
    ): Promise<{ btJumpoint: JumpointCreatedDtoOutput; existedInBeyondTrust: boolean }> {
        try {
            const btJumpoint = await this.createBTJumpoint(command);
            return { btJumpoint, existedInBeyondTrust: false };
        } catch (error) {
            if (ErrorProcessorUtility.isBeyondTrustUnprocessableEntityError(error)) {
                console.warn(
                    `[${command.transactionId}] Jumpoint "${command.name}" already exists in BeyondTrust ` +
                        `(tenant: ${command.tenantId}). Fetching existing jumpoint to ensure idempotency.`,
                );

                const existing = await this.fetchExistingBTJumpointByName(
                    command.transactionId,
                    command.tenantId,
                    command.name,
                );

                if (existing) {
                    // JumpointRetrievedDtoOutput has an identical structure to JumpointCreatedDtoOutput;
                    // casting is safe here.
                    return {
                        btJumpoint: existing as unknown as JumpointCreatedDtoOutput,
                        existedInBeyondTrust: true,
                    };
                }
            }

            throw error;
        }
    }

    /**
     * Fetches the first jumpoint from BeyondTrust that exactly matches the given name.
     */
    private async fetchExistingBTJumpointByName(
        transactionId: string,
        tenantId: number,
        name: string,
    ): Promise<JumpointRetrievedDtoOutput | null> {
        const jumpoints = await this.queryBus.execute<BTRetrieveJumpointsQuery, JumpointRetrievedDtoOutput[]>(
            new BTRetrieveJumpointsQuery(
                transactionId,
                tenantId,
                1,
                1,
                name,
                undefined,
                undefined,
                undefined,
                undefined,
            ),
        );
        return jumpoints[0] ?? null;
    }

    private async createBTJumpoint(command: CreateJumpointCommand) {
        return await this.commandBus.execute<BTCreateJumpointCommand, JumpointCreatedDtoOutput>(
            new BTCreateJumpointCommand(
                command.transactionId,
                command.tenantId,
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
