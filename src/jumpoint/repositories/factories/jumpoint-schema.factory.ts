import { EntitySchema } from 'typeorm';
import { BaseTenantEntitySchemaFactory } from '../../../core/factories';
import { JumpointPlatformType, JzpClientAddressRestrictionsType } from '../../enums';
import { Jumpoint } from '../../models';

export class JumpointSchemaFactory implements BaseTenantEntitySchemaFactory<Jumpoint> {
    public static readonly TABLE_NAME = 'jumpoints';

    public create(tenantId: number): EntitySchema<Jumpoint> {
        return new EntitySchema<Jumpoint>({
            name: `${JumpointSchemaFactory.TABLE_NAME}_${tenantId}`,
            tableName: `${JumpointSchemaFactory.TABLE_NAME}_${tenantId}`,
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
                platformType: {
                    name: 'platform_type',
                    type: 'enum',
                    enum: JumpointPlatformType,
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
                isEnabled: {
                    name: 'is_enabled',
                    type: 'boolean',
                    nullable: true,
                },
                isConnected: {
                    name: 'is_connected',
                    type: 'boolean',
                    nullable: true,
                },
                isClustered: {
                    name: 'is_clustered',
                    type: 'boolean',
                    nullable: true,
                },
                isShellJumpEnabled: {
                    name: 'is_shell_jump_enabled',
                    type: 'boolean',
                    nullable: true,
                },
                externalJumpItemNetworkId: {
                    name: 'external_jump_item_network_id',
                    type: 'text',
                    nullable: true,
                },
                isProtocolTunnelEnabled: {
                    name: 'is_protocol_tunnel_enabled',
                    type: 'boolean',
                    nullable: true,
                },
                rdpServiceAccountId: {
                    name: 'rdp_service_account_id',
                    type: 'int',
                    nullable: true,
                },
                managedIpRanges: {
                    name: 'managed_ip_ranges',
                    type: 'json',
                    nullable: true,
                },
                isJzpEnabled: {
                    name: 'is_jzp_enabled',
                    type: 'boolean',
                    nullable: true,
                },
                jzpProxyHostname: {
                    name: 'jzp_proxy_hostname',
                    type: 'text',
                    nullable: true,
                },
                jzpProxyPort: {
                    name: 'jzp_proxy_port',
                    type: 'int',
                    nullable: true,
                },
                isJzpHttpGetAllowed: {
                    name: 'is_jzp_http_get_allowed',
                    type: 'boolean',
                    nullable: true,
                },
                jzpClientAddressRestrictionsType: {
                    name: 'jzp_client_address_restrictions_type',
                    type: 'enum',
                    enum: JzpClientAddressRestrictionsType,
                    nullable: true,
                },
                jzpRestrictedIps: {
                    name: 'jzp_restricted_ips',
                    type: 'simple-array',
                    nullable: true,
                },
                dockerDeployKey: {
                    name: 'docker_deploy_key',
                    type: 'varchar',
                    nullable: true,
                },
                keyInfo: {
                    name: 'key_info',
                    type: 'varchar',
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
                groupPolicyJumpoints: {
                    type: 'one-to-many',
                    target: `group_policy_jumpoints_${tenantId}`,
                    inverseSide: 'jumpoint',
                },
                protocolTunnelJumps: {
                    type: 'one-to-many',
                    target: `jump_item_protocol_tunnel_jumps_${tenantId}`,
                    inverseSide: 'jumpoint',
                },
                remoteRdps: {
                    type: 'one-to-many',
                    target: `jump_item_remote_rdps_${tenantId}`,
                    inverseSide: 'jumpoint',
                },
                remoteVncs: {
                    type: 'one-to-many',
                    target: `jump_item_remote_vncs_${tenantId}`,
                    inverseSide: 'jumpoint',
                },
                shellJumps: {
                    type: 'one-to-many',
                    target: `jump_item_shell_jumps_${tenantId}`,
                    inverseSide: 'jumpoint',
                },
                webJumps: {
                    type: 'one-to-many',
                    target: `jump_item_web_jumps_${tenantId}`,
                    inverseSide: 'jumpoint',
                },
                jumpointNodes: {
                    type: 'one-to-many',
                    target: `jumpoint_nodes_${tenantId}`,
                    inverseSide: 'jumpoint',
                },
            },
        });
    }
}
