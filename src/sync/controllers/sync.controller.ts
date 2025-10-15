import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AppConfigService } from '../../app-config/services/app-config.service';
import { ApiTenantIdHeader, TenantIdHeader } from '../../core/decorators';
import { UuidUtility } from '../../shared/utilities';
import { SyncComparatorCommand } from '../commands';
import { SyncComparisonOverviewDtoOutput } from '../dtos/outputs';
import { SyncEntityType } from '../enums';
import { SyncComparisonOverview } from '../models';

@ApiTenantIdHeader()
@ApiTags('Sync')
@Controller('sync')
export class SyncController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly appConfigService: AppConfigService,
    ) {}

    @Post()
    @ApiOkResponse()
    @HttpCode(HttpStatus.OK)
    public async syncAll(@TenantIdHeader() tenantId: number): Promise<unknown> {
        const syncOrders = [
            { name: 'jump-policies', func: () => this.syncJumpPolicies(tenantId) }, // Required dependency for jump assets
            { name: 'jump-groups', func: () => this.syncJumpGroups(tenantId) }, // Required dependency for jump assets
            { name: 'jumpoints', func: () => this.syncJumpoints(tenantId) }, // Required dependency for jump assets
            { name: 'protocol-tunnel-jumps', func: () => this.syncJumpItemsProtocolTunnelJumps(tenantId) },
            { name: 'remote-rdps', func: () => this.syncJumpItemsRemoteRdps(tenantId) },
            { name: 'remote-vncs', func: () => this.syncJumpItemsRemoteVncs(tenantId) },
            { name: 'shell-jumps', func: () => this.syncJumpItemsShellJumps(tenantId) },
            { name: 'web-jumps', func: () => this.syncJumpItemsWebJumps(tenantId) },
            { name: 'jump-clients', func: () => this.syncJumpClients(tenantId) },
            { name: 'jump-client-installers', func: () => this.syncJumpClientInstallers(tenantId) },
            { name: 'users', func: () => this.syncUsers(tenantId) }, // Automatically trigger sync for relational data with group policies after group policies are synced
            { name: 'teams', func: () => this.syncTeams(tenantId) }, // Automatically trigger sync for relational data with users
            { name: 'group-policies', func: () => this.syncGroupPolicies(tenantId) }, // Automatically trigger sync for relational data with jump groups, jumpoints, users, teams
        ];

        const syncResults = [];

        for (const sync of syncOrders) {
            for (let attempt = 1; attempt <= this.appConfigService.sync.cronJobRetryAttempts; attempt++) {
                try {
                    console.log(`Starting sync for ${sync.name}, attempt ${attempt}`);

                    const syncResult = await sync.func();
                    syncResults.push({ name: sync.name, ...syncResult });

                    break; // success, move to next function
                } catch (error) {
                    console.error(`Sync failed on attempt ${attempt} for ${sync.name}:`, error);

                    if (attempt === this.appConfigService.sync.cronJobRetryAttempts) {
                        console.error(`All sync attempts failed for ${sync.name}.`);
                    }

                    await new Promise((r) => setTimeout(r, this.appConfigService.sync.cronJobRetryDelayInMs));
                }
            }
        }

        return syncResults;
    }

    @Post('users')
    @ApiOkResponse({ type: SyncComparisonOverviewDtoOutput })
    @HttpCode(HttpStatus.OK)
    public async syncUsers(@TenantIdHeader() tenantId: number): Promise<SyncComparisonOverviewDtoOutput> {
        return await this.commandBus.execute<SyncComparatorCommand, SyncComparisonOverview>(
            new SyncComparatorCommand(UuidUtility.generate(), tenantId, SyncEntityType.User),
        );
    }

    @Post('teams')
    @ApiOkResponse({ type: SyncComparisonOverviewDtoOutput })
    @HttpCode(HttpStatus.OK)
    public async syncTeams(@TenantIdHeader() tenantId: number): Promise<SyncComparisonOverviewDtoOutput> {
        return await this.commandBus.execute<SyncComparatorCommand, SyncComparisonOverview>(
            new SyncComparatorCommand(UuidUtility.generate(), tenantId, SyncEntityType.Team),
        );
    }

    @Post('jump-clients')
    @ApiOkResponse({ type: SyncComparisonOverviewDtoOutput })
    @HttpCode(HttpStatus.OK)
    public async syncJumpClients(@TenantIdHeader() tenantId: number): Promise<SyncComparisonOverviewDtoOutput> {
        return await this.commandBus.execute<SyncComparatorCommand, SyncComparisonOverview>(
            new SyncComparatorCommand(UuidUtility.generate(), tenantId, SyncEntityType.JumpClient),
        );
    }

    @Post('jump-clients/installers')
    @ApiOkResponse({ type: SyncComparisonOverviewDtoOutput })
    @HttpCode(HttpStatus.OK)
    public async syncJumpClientInstallers(
        @TenantIdHeader() tenantId: number,
    ): Promise<SyncComparisonOverviewDtoOutput> {
        return await this.commandBus.execute<SyncComparatorCommand, SyncComparisonOverview>(
            new SyncComparatorCommand(UuidUtility.generate(), tenantId, SyncEntityType.JumpClientInstaller),
        );
    }

    @Post('group-policies')
    @ApiOkResponse({ type: SyncComparisonOverviewDtoOutput })
    @HttpCode(HttpStatus.OK)
    public async syncGroupPolicies(@TenantIdHeader() tenantId: number): Promise<SyncComparisonOverviewDtoOutput> {
        return await this.commandBus.execute<SyncComparatorCommand, SyncComparisonOverview>(
            new SyncComparatorCommand(UuidUtility.generate(), tenantId, SyncEntityType.GroupPolicy),
        );
    }

    @Post('jump-policies')
    @ApiOkResponse({ type: SyncComparisonOverviewDtoOutput })
    @HttpCode(HttpStatus.OK)
    public async syncJumpPolicies(@TenantIdHeader() tenantId: number): Promise<SyncComparisonOverviewDtoOutput> {
        return await this.commandBus.execute<SyncComparatorCommand, SyncComparisonOverview>(
            new SyncComparatorCommand(UuidUtility.generate(), tenantId, SyncEntityType.JumpPolicy),
        );
    }

    @Post('jump-groups')
    @ApiOkResponse({ type: SyncComparisonOverviewDtoOutput })
    @HttpCode(HttpStatus.OK)
    public async syncJumpGroups(@TenantIdHeader() tenantId: number): Promise<SyncComparisonOverviewDtoOutput> {
        return await this.commandBus.execute<SyncComparatorCommand, SyncComparisonOverview>(
            new SyncComparatorCommand(UuidUtility.generate(), tenantId, SyncEntityType.JumpGroup),
        );
    }

    @Post('jumpoints')
    @ApiOkResponse({ type: SyncComparisonOverviewDtoOutput })
    @HttpCode(HttpStatus.OK)
    public async syncJumpoints(@TenantIdHeader() tenantId: number): Promise<SyncComparisonOverviewDtoOutput> {
        return await this.commandBus.execute<SyncComparatorCommand, SyncComparisonOverview>(
            new SyncComparatorCommand(UuidUtility.generate(), tenantId, SyncEntityType.Jumpoint),
        );
    }

    @Post('jump-items/protocol-tunnel-jumps')
    @ApiOkResponse({ type: SyncComparisonOverviewDtoOutput })
    @HttpCode(HttpStatus.OK)
    public async syncJumpItemsProtocolTunnelJumps(
        @TenantIdHeader() tenantId: number,
    ): Promise<SyncComparisonOverviewDtoOutput> {
        return await this.commandBus.execute<SyncComparatorCommand, SyncComparisonOverview>(
            new SyncComparatorCommand(UuidUtility.generate(), tenantId, SyncEntityType.JumpItemProtocolTunnelJump),
        );
    }

    @Post('jump-items/remote-rdps')
    @ApiOkResponse({ type: SyncComparisonOverviewDtoOutput })
    @HttpCode(HttpStatus.OK)
    public async syncJumpItemsRemoteRdps(@TenantIdHeader() tenantId: number): Promise<SyncComparisonOverviewDtoOutput> {
        return await this.commandBus.execute<SyncComparatorCommand, SyncComparisonOverview>(
            new SyncComparatorCommand(UuidUtility.generate(), tenantId, SyncEntityType.JumpItemRemoteRdp),
        );
    }

    @Post('jump-items/remote-vncs')
    @ApiOkResponse({ type: SyncComparisonOverviewDtoOutput })
    @HttpCode(HttpStatus.OK)
    public async syncJumpItemsRemoteVncs(@TenantIdHeader() tenantId: number): Promise<SyncComparisonOverviewDtoOutput> {
        return await this.commandBus.execute<SyncComparatorCommand, SyncComparisonOverview>(
            new SyncComparatorCommand(UuidUtility.generate(), tenantId, SyncEntityType.JumpItemRemoteVnc),
        );
    }

    @Post('jump-items/shell-jumps')
    @ApiOkResponse({ type: SyncComparisonOverviewDtoOutput })
    @HttpCode(HttpStatus.OK)
    public async syncJumpItemsShellJumps(@TenantIdHeader() tenantId: number): Promise<SyncComparisonOverviewDtoOutput> {
        return await this.commandBus.execute<SyncComparatorCommand, SyncComparisonOverview>(
            new SyncComparatorCommand(UuidUtility.generate(), tenantId, SyncEntityType.JumpItemShellJump),
        );
    }

    @Post('jump-items/web-jumps')
    @ApiOkResponse({ type: SyncComparisonOverviewDtoOutput })
    @HttpCode(HttpStatus.OK)
    public async syncJumpItemsWebJumps(@TenantIdHeader() tenantId: number): Promise<SyncComparisonOverviewDtoOutput> {
        return await this.commandBus.execute<SyncComparatorCommand, SyncComparisonOverview>(
            new SyncComparatorCommand(UuidUtility.generate(), tenantId, SyncEntityType.JumpItemWebJump),
        );
    }
}
