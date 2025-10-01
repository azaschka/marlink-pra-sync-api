import { EntitySchema } from 'typeorm';
import { BaseTenantEntitySchemaFactory } from '../../../core/factories';
import {
    JumpClientConnectionType,
    JumpClientEndpointAgreementPolicyType,
    JumpClientGroupType,
    JumpClientInstallMode,
    JumpClientUnavailableReasonType,
} from '../../enums';
import { JumpClient } from '../../models';

export class JumpClientSchemaFactory implements BaseTenantEntitySchemaFactory<JumpClient> {
    public static readonly TABLE_NAME = 'jump_clients';

    public create(tenantId: number): EntitySchema<JumpClient> {
        return new EntitySchema<JumpClient>({
            name: `${JumpClientSchemaFactory.TABLE_NAME}_${tenantId}`,
            tableName: `${JumpClientSchemaFactory.TABLE_NAME}_${tenantId}`,
            columns: {
                id: {
                    name: 'id',
                    type: 'int',
                    primary: true,
                    generated: undefined,
                    unique: true,
                },
                jumpGroupId: {
                    name: 'jump_group_id',
                    type: 'int',
                    nullable: false,
                },
                jumpGroupType: {
                    name: 'jump_group_type',
                    type: 'enum',
                    enum: JumpClientGroupType,
                    nullable: true,
                },
                name: {
                    name: 'name',
                    type: 'varchar',
                    nullable: true,
                },
                hostname: {
                    name: 'hostname',
                    type: 'varchar',
                    nullable: true,
                },
                fqdn: {
                    name: 'fqdn',
                    type: 'varchar',
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
                installMode: {
                    name: 'install_mode',
                    type: 'enum',
                    enum: JumpClientInstallMode,
                    nullable: true,
                },
                connectionType: {
                    name: 'connection_type',
                    type: 'enum',
                    enum: JumpClientConnectionType,
                    nullable: true,
                },
                lastConnectDate: {
                    name: 'last_connect_date',
                    type: 'timestamp',
                    nullable: true,
                },
                lastDisconnectDate: {
                    name: 'last_disconnect_date',
                    type: 'timestamp',
                    nullable: true,
                },
                isLost: {
                    name: 'is_lost',
                    type: 'boolean',
                    nullable: true,
                },
                needsUpdate: {
                    name: 'needs_update',
                    type: 'boolean',
                    nullable: true,
                },
                unavailableReasonType: {
                    name: 'unavailable_reason_type',
                    type: 'enum',
                    enum: JumpClientUnavailableReasonType,
                    nullable: true,
                },
                operatingSystem: {
                    name: 'operating_system',
                    type: 'varchar',
                    nullable: true,
                },
                publicIp: {
                    name: 'public_ip',
                    type: 'varchar',
                    nullable: true,
                },
                privateIp: {
                    name: 'private_ip',
                    type: 'varchar',
                    nullable: true,
                },
                consoleUser: {
                    name: 'console_user',
                    type: 'varchar',
                    nullable: true,
                },
                expirationDate: {
                    name: 'expiration_date',
                    type: 'timestamp',
                    nullable: true,
                },
                maxOfflineDurationInMinutes: {
                    name: 'max_offline_duration_in_minutes',
                    type: 'int',
                    nullable: true,
                },
                lastAccessDate: {
                    name: 'last_access_date',
                    type: 'timestamp',
                    nullable: true,
                },
                endpointAgreementPolicyType: {
                    name: 'endpoint_agreement_policy_type',
                    type: 'enum',
                    enum: JumpClientEndpointAgreementPolicyType,
                    nullable: true,
                },
                jumpointProxy: {
                    name: 'jumpoint_proxy',
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
                jumpGroup: {
                    type: 'many-to-one',
                    target: `jump_groups_${tenantId}`,
                    joinColumn: {
                        name: 'jump_group_id',
                    },
                    inverseSide: 'jumpClients',
                    onDelete: 'CASCADE',
                    eager: true,
                },
                jumpPolicy: {
                    type: 'many-to-one',
                    target: `jump_policies_${tenantId}`,
                    joinColumn: {
                        name: 'jump_policy_id',
                    },
                    inverseSide: 'jumpClients',
                    onDelete: 'SET NULL',
                    eager: true,
                    nullable: true,
                },
            },
        });
    }
}
