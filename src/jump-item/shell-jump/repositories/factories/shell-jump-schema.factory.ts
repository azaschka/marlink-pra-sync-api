import { EntitySchema } from 'typeorm';
import { BaseTenantEntitySchemaFactory } from '../../../../core/factories';
import { JumpGroupType, ShellJumpProtocolType, ShellJumpTerminalType } from '../../enums';
import { ShellJump } from '../../models';

export class ShellJumpSchemaFactory implements BaseTenantEntitySchemaFactory<ShellJump> {
    public static readonly TABLE_NAME = 'jump_item_shell_jumps';

    public create(tenantId: number): EntitySchema<ShellJump> {
        return new EntitySchema<ShellJump>({
            name: `${ShellJumpSchemaFactory.TABLE_NAME}_${tenantId}`,
            tableName: `${ShellJumpSchemaFactory.TABLE_NAME}_${tenantId}`,
            columns: {
                id: {
                    name: 'id',
                    type: 'int',
                    primary: true,
                    generated: undefined,
                    unique: true,
                },
                name: {
                    name: 'name',
                    type: 'varchar',
                    nullable: false,
                },
                jumpointId: {
                    name: 'jumpoint_id',
                    type: 'int',
                    nullable: false,
                },
                hostname: {
                    name: 'hostname',
                    type: 'varchar',
                    nullable: false,
                },
                protocolType: {
                    name: 'protocol_type',
                    type: 'enum',
                    enum: ShellJumpProtocolType,
                    nullable: false,
                },
                port: {
                    name: 'port',
                    type: 'int',
                    nullable: true,
                },
                jumpGroupId: {
                    name: 'jump_group_id',
                    type: 'int',
                    nullable: false,
                },
                jumpGroupType: {
                    name: 'jump_group_type',
                    type: 'enum',
                    enum: JumpGroupType,
                    nullable: true,
                },
                terminalType: {
                    name: 'terminal_type',
                    type: 'enum',
                    enum: ShellJumpTerminalType,
                    nullable: true,
                },
                keepAliveIdleSessionInSeconds: {
                    name: 'keep_alive_idle_session_in_seconds',
                    type: 'int',
                    nullable: true,
                },
                tag: {
                    name: 'tag',
                    type: 'varchar',
                    nullable: true,
                },
                comments: {
                    name: 'comments',
                    type: 'text',
                    nullable: true,
                },
                jumpPolicyId: {
                    name: 'jump_policy_id',
                    type: 'int',
                    nullable: true,
                },
                username: {
                    name: 'username',
                    type: 'varchar',
                    nullable: true,
                },
                sessionPolicyId: {
                    name: 'session_policy_id',
                    type: 'int',
                    nullable: true,
                },
                lastSyncDate: {
                    name: 'last_sync_date',
                    type: 'timestamp',
                    precision: 3,
                    nullable: false,
                },
            },
            relations: {
                jumpoint: {
                    type: 'many-to-one',
                    target: `jumpoints_${tenantId}`,
                    joinColumn: {
                        name: 'jumpoint_id',
                    },
                    inverseSide: 'shellJumps',
                    onDelete: 'CASCADE',
                    eager: true,
                },
                jumpGroup: {
                    type: 'many-to-one',
                    target: `jump_groups_${tenantId}`,
                    joinColumn: {
                        name: 'jump_group_id',
                    },
                    inverseSide: 'shellJumps',
                    onDelete: 'CASCADE',
                    eager: true,
                },
                jumpPolicy: {
                    type: 'many-to-one',
                    target: `jump_policies_${tenantId}`,
                    joinColumn: {
                        name: 'jump_policy_id',
                    },
                    inverseSide: 'shellJumps',
                    onDelete: 'SET NULL',
                    eager: true,
                    nullable: true,
                },
            },
        });
    }
}
