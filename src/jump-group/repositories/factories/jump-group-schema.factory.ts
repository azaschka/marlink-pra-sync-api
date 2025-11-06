import { EntitySchema } from 'typeorm';
import { BaseTenantEntitySchemaFactory } from '../../../core/factories';
import { JumpGroup } from '../../models';

export class JumpGroupSchemaFactory implements BaseTenantEntitySchemaFactory<JumpGroup> {
    public static readonly TABLE_NAME = 'jump_groups';

    public create(tenantId: number): EntitySchema<JumpGroup> {
        return new EntitySchema<JumpGroup>({
            name: `${JumpGroupSchemaFactory.TABLE_NAME}_${tenantId}`,
            tableName: `${JumpGroupSchemaFactory.TABLE_NAME}_${tenantId}`,
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
                codeName: {
                    name: 'code_name',
                    type: 'varchar',
                    nullable: true,
                },
                comments: {
                    name: 'comments',
                    type: 'text',
                    nullable: true,
                },
                lastSyncDate: {
                    name: 'last_sync_date',
                    type: 'timestamp',
                    precision: 3,
                    nullable: false,
                    updateDate: true,
                },
            },
            relations: {
                groupPolicyJumpGroups: {
                    type: 'one-to-many',
                    target: `group_policy_jump_groups_${tenantId}`,
                    inverseSide: 'jumpGroup',
                },
                protocolTunnelJumps: {
                    type: 'one-to-many',
                    target: `jump_item_protocol_tunnel_jumps_${tenantId}`,
                    inverseSide: 'jumpGroup',
                },
                remoteRdps: {
                    type: 'one-to-many',
                    target: `jump_item_remote_rdps_${tenantId}`,
                    inverseSide: 'jumpGroup',
                },
                remoteVncs: {
                    type: 'one-to-many',
                    target: `jump_item_remote_vncs_${tenantId}`,
                    inverseSide: 'jumpGroup',
                },
                shellJumps: {
                    type: 'one-to-many',
                    target: `jump_item_shell_jumps_${tenantId}`,
                    inverseSide: 'jumpGroup',
                },
                webJumps: {
                    type: 'one-to-many',
                    target: `jump_item_web_jumps_${tenantId}`,
                    inverseSide: 'jumpGroup',
                },
                jumpClients: {
                    type: 'one-to-many',
                    target: `jump_clients_${tenantId}`,
                    inverseSide: 'jumpGroup',
                },
            },
        });
    }
}
