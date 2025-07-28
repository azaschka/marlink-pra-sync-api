import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AppConfigService } from '../../app-config/services/app-config.service';
import { SyncGroupPoliciesCommand } from '../../group-policy/commands';
import { GroupPoliciesSyncResult } from '../../group-policy/models';
import { SyncJumpClientInstallersCommand, SyncJumpClientsCommand } from '../../jump-client/commands';
import { JumpClientInstallersSyncResult, JumpClientsSyncResult } from '../../jump-client/models';
import { SyncJumpGroupsCommand } from '../../jump-group/commands';
import { JumpGroupsSyncResult } from '../../jump-group/models';
import { SyncProtocolTunnelJumpsCommand } from '../../jump-item/protocol-tunnel-jump/commands';
import { ProtocolTunnelJumpsSyncResult } from '../../jump-item/protocol-tunnel-jump/models';
import { SyncRemoteRdpsCommand } from '../../jump-item/remote-rdp/commands';
import { RemoteRdpsSyncResult } from '../../jump-item/remote-rdp/models';
import { SyncRemoteVncsCommand } from '../../jump-item/remote-vnc/commands';
import { RemoteVncsSyncResult } from '../../jump-item/remote-vnc/models';
import { SyncShellJumpsCommand } from '../../jump-item/shell-jump/commands';
import { ShellJumpsSyncResult } from '../../jump-item/shell-jump/models';
import { SyncWebJumpsCommand } from '../../jump-item/web-jump/commands';
import { WebJumpsSyncResult } from '../../jump-item/web-jump/models';
import { SyncJumpPoliciesCommand } from '../../jump-policy/commands';
import { JumpPoliciesSyncResult } from '../../jump-policy/models';
import { SyncJumpointsCommand } from '../../jumpoint/commands';
import { JumpointsSyncResult } from '../../jumpoint/models';
import { UuidUtility } from '../../shared/utilities';
import { SyncTeamsCommand } from '../../team/commands';
import { TeamsSyncResult } from '../../team/models';
import { SyncUsersCommand } from '../../user/commands';
import { UsersSyncResult } from '../../user/models';
import { SyncResultDtoOutput } from '../dtos/outputs';

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
    public async syncAll(): Promise<unknown> {
        const syncOrders = [
            { name: 'jumpoints', func: () => this.syncJumpoints() }, // Required dependency for jump items
            { name: 'protocol-tunnel-jumps', func: () => this.syncJumpItemsProtocolTunnelJumps() },
            { name: 'remote-rdps', func: () => this.syncJumpItemsRemoteRdps() },
            { name: 'remote-vncs', func: () => this.syncJumpItemsRemoteVncs() },
            { name: 'shell-jumps', func: () => this.syncJumpItemsShellJumps() },
            { name: 'web-jumps', func: () => this.syncJumpItemsWebJumps() },
            { name: 'jump-clients', func: () => this.syncJumpClients() },
            { name: 'jump-client-installers', func: () => this.syncJumpClientInstallers() },
            { name: 'jump-policies', func: () => this.syncJumpPolicies() },
            { name: 'jump-groups', func: () => this.syncJumpGroups() },
            { name: 'users', func: () => this.syncUsers() }, // Automatically trigger sync for relational data with group policies after group policies are synced
            { name: 'teams', func: () => this.syncTeams() }, // Automatically trigger sync for relational data with users
            { name: 'group-policies', func: () => this.syncGroupPolicies() }, // Automatically trigger sync for relational data with jump groups, jumpoints, users, teams
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
    @ApiOkResponse({ type: SyncResultDtoOutput })
    @HttpCode(HttpStatus.OK)
    public async syncUsers(): Promise<SyncResultDtoOutput> {
        const result = await this.commandBus.execute<SyncUsersCommand, UsersSyncResult>(
            new SyncUsersCommand(UuidUtility.generate()),
        );

        return {
            createdIds: result.createdUserIds,
            updatedIds: result.updatedUserIds,
            deletedIds: result.deletedUserIds,
        };
    }

    @Post('teams')
    @ApiOkResponse({ type: SyncResultDtoOutput })
    @HttpCode(HttpStatus.OK)
    public async syncTeams(): Promise<SyncResultDtoOutput> {
        const result = await this.commandBus.execute<SyncTeamsCommand, TeamsSyncResult>(
            new SyncTeamsCommand(UuidUtility.generate()),
        );

        return {
            createdIds: result.createdTeamIds,
            updatedIds: result.updatedTeamIds,
            deletedIds: result.deletedTeamIds,
        };
    }

    @Post('jump-clients')
    @ApiOkResponse({ type: SyncResultDtoOutput })
    @HttpCode(HttpStatus.OK)
    public async syncJumpClients(): Promise<SyncResultDtoOutput> {
        const result = await this.commandBus.execute<SyncJumpClientsCommand, JumpClientsSyncResult>(
            new SyncJumpClientsCommand(UuidUtility.generate()),
        );

        return {
            createdIds: result.createdJumpClientIds,
            updatedIds: result.updatedJumpClientIds,
            deletedIds: result.deletedJumpClientIds,
        };
    }

    @Post('jump-clients/installers')
    @ApiOkResponse({ type: SyncResultDtoOutput })
    @HttpCode(HttpStatus.OK)
    public async syncJumpClientInstallers(): Promise<SyncResultDtoOutput> {
        const result = await this.commandBus.execute<SyncJumpClientInstallersCommand, JumpClientInstallersSyncResult>(
            new SyncJumpClientInstallersCommand(UuidUtility.generate()),
        );

        return {
            createdIds: result.createdJumpClientInstallerIds,
            updatedIds: result.updatedJumpClientInstallerIds,
            deletedIds: result.deletedJumpClientInstallerIds,
        };
    }

    @Post('group-policies')
    @ApiOkResponse({ type: SyncResultDtoOutput })
    @HttpCode(HttpStatus.OK)
    public async syncGroupPolicies(): Promise<SyncResultDtoOutput> {
        const result = await this.commandBus.execute<SyncGroupPoliciesCommand, GroupPoliciesSyncResult>(
            new SyncGroupPoliciesCommand(UuidUtility.generate()),
        );

        return {
            createdIds: result.createdGroupPolicyIds,
            updatedIds: result.updatedGroupPolicyIds,
            deletedIds: result.deletedGroupPolicyIds,
        };
    }

    @Post('jump-policies')
    @ApiOkResponse({ type: SyncResultDtoOutput })
    @HttpCode(HttpStatus.OK)
    public async syncJumpPolicies(): Promise<SyncResultDtoOutput> {
        const result = await this.commandBus.execute<SyncJumpPoliciesCommand, JumpPoliciesSyncResult>(
            new SyncJumpPoliciesCommand(UuidUtility.generate()),
        );

        return {
            createdIds: result.createdJumpPolicyIds,
            updatedIds: result.updatedJumpPolicyIds,
            deletedIds: result.deletedJumpPolicyIds,
        };
    }

    @Post('jump-groups')
    @ApiOkResponse({ type: SyncResultDtoOutput })
    @HttpCode(HttpStatus.OK)
    public async syncJumpGroups(): Promise<SyncResultDtoOutput> {
        const result = await this.commandBus.execute<SyncJumpGroupsCommand, JumpGroupsSyncResult>(
            new SyncJumpGroupsCommand(UuidUtility.generate()),
        );

        return {
            createdIds: result.createdJumpGroupIds,
            updatedIds: result.updatedJumpGroupIds,
            deletedIds: result.deletedJumpGroupIds,
        };
    }

    @Post('jumpoints')
    @ApiOkResponse({ type: SyncResultDtoOutput })
    @HttpCode(HttpStatus.OK)
    public async syncJumpoints(): Promise<SyncResultDtoOutput> {
        const result = await this.commandBus.execute<SyncJumpointsCommand, JumpointsSyncResult>(
            new SyncJumpointsCommand(UuidUtility.generate()),
        );

        return {
            createdIds: result.createdJumpointIds,
            updatedIds: result.updatedJumpointIds,
            deletedIds: result.deletedJumpointIds,
        };
    }

    @Post('jump-items/protocol-tunnel-jumps')
    @ApiOkResponse({ type: SyncResultDtoOutput })
    @HttpCode(HttpStatus.OK)
    public async syncJumpItemsProtocolTunnelJumps(): Promise<SyncResultDtoOutput> {
        const result = await this.commandBus.execute<SyncProtocolTunnelJumpsCommand, ProtocolTunnelJumpsSyncResult>(
            new SyncProtocolTunnelJumpsCommand(UuidUtility.generate()),
        );

        return {
            createdIds: result.createdProtocolTunnelJumpIds,
            updatedIds: result.updatedProtocolTunnelJumpIds,
            deletedIds: result.deletedProtocolTunnelJumpIds,
        };
    }

    @Post('jump-items/remote-rdps')
    @ApiOkResponse({ type: SyncResultDtoOutput })
    @HttpCode(HttpStatus.OK)
    public async syncJumpItemsRemoteRdps(): Promise<SyncResultDtoOutput> {
        const result = await this.commandBus.execute<SyncRemoteRdpsCommand, RemoteRdpsSyncResult>(
            new SyncRemoteRdpsCommand(UuidUtility.generate()),
        );

        return {
            createdIds: result.createdRemoteRdpIds,
            updatedIds: result.updatedRemoteRdpIds,
            deletedIds: result.deletedRemoteRdpIds,
        };
    }

    @Post('jump-items/remote-vncs')
    @ApiOkResponse({ type: SyncResultDtoOutput })
    @HttpCode(HttpStatus.OK)
    public async syncJumpItemsRemoteVncs(): Promise<SyncResultDtoOutput> {
        const result = await this.commandBus.execute<SyncRemoteVncsCommand, RemoteVncsSyncResult>(
            new SyncRemoteVncsCommand(UuidUtility.generate()),
        );

        return {
            createdIds: result.createdRemoteVncIds,
            updatedIds: result.updatedRemoteVncIds,
            deletedIds: result.deletedRemoteVncIds,
        };
    }

    @Post('jump-items/shell-jumps')
    @ApiOkResponse({ type: SyncResultDtoOutput })
    @HttpCode(HttpStatus.OK)
    public async syncJumpItemsShellJumps(): Promise<SyncResultDtoOutput> {
        const result = await this.commandBus.execute<SyncShellJumpsCommand, ShellJumpsSyncResult>(
            new SyncShellJumpsCommand(UuidUtility.generate()),
        );

        return {
            createdIds: result.createdShellJumpIds,
            updatedIds: result.updatedShellJumpIds,
            deletedIds: result.deletedShellJumpIds,
        };
    }

    @Post('jump-items/web-jumps')
    @ApiOkResponse({ type: SyncResultDtoOutput })
    @HttpCode(HttpStatus.OK)
    public async syncJumpItemsWebJumps(): Promise<SyncResultDtoOutput> {
        const result = await this.commandBus.execute<SyncWebJumpsCommand, WebJumpsSyncResult>(
            new SyncWebJumpsCommand(UuidUtility.generate()),
        );

        return {
            createdIds: result.createdWebJumpIds,
            updatedIds: result.updatedWebJumpIds,
            deletedIds: result.deletedWebJumpIds,
        };
    }
}
