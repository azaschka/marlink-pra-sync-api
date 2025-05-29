import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SyncGroupPoliciesCommand } from '../../group-policy/commands';
import { GroupPoliciesSyncResult } from '../../group-policy/models';
import { SyncJumpGroupsCommand } from '../../jump-group/commands';
import { JumpGroupsSyncResult } from '../../jump-group/models';
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
    constructor(private readonly commandBus: CommandBus) {}

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
}
