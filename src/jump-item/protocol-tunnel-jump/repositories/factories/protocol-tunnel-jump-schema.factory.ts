import { EntitySchema } from 'typeorm';
import { BaseTenantEntitySchemaFactory } from '../../../../core/factories';
import { JumpGroupType, TunnelType } from '../../enums';
import { ProtocolTunnelJump } from '../../models';

export class ProtocolTunnelJumpSchemaFactory implements BaseTenantEntitySchemaFactory<ProtocolTunnelJump> {
    public static readonly TABLE_NAME = 'jump_item_protocol_tunnel_jumps';

    public create(tenantId: number): EntitySchema<ProtocolTunnelJump> {
        return new EntitySchema<ProtocolTunnelJump>({
            name: `${ProtocolTunnelJumpSchemaFactory.TABLE_NAME}_${tenantId}`,
            tableName: `${ProtocolTunnelJumpSchemaFactory.TABLE_NAME}_${tenantId}`,
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
                sessionPolicyId: {
                    name: 'session_policy_id',
                    type: 'int',
                    nullable: true,
                },
                tunnelListenAddress: {
                    name: 'tunnel_listen_address',
                    type: 'varchar',
                    nullable: true,
                },
                tunnelDefinitions: {
                    name: 'tunnel_definitions',
                    type: 'text',
                    nullable: true,
                },
                tunnelType: {
                    name: 'tunnel_type',
                    type: 'enum',
                    enum: TunnelType,
                    nullable: true,
                },
                username: {
                    name: 'username',
                    type: 'varchar',
                    nullable: true,
                },
                database: {
                    name: 'database',
                    type: 'varchar',
                    nullable: true,
                },
                url: {
                    name: 'url',
                    type: 'text',
                    nullable: true,
                },
                caCertificates: {
                    name: 'ca_certificates',
                    type: 'text',
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
                    inverseSide: 'protocolTunnelJumps',
                    onDelete: 'CASCADE',
                    eager: true,
                },
                jumpGroup: {
                    type: 'many-to-one',
                    target: `jump_groups_${tenantId}`,
                    joinColumn: {
                        name: 'jump_group_id',
                    },
                    inverseSide: 'protocolTunnelJumps',
                    onDelete: 'CASCADE',
                    eager: true,
                },
                jumpPolicy: {
                    type: 'many-to-one',
                    target: `jump_policies_${tenantId}`,
                    joinColumn: {
                        name: 'jump_policy_id',
                    },
                    inverseSide: 'protocolTunnelJumps',
                    onDelete: 'SET NULL',
                    eager: true,
                    nullable: true,
                },
            },
        });
    }
}
