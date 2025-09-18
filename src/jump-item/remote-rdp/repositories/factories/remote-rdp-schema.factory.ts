import { EntitySchema } from 'typeorm';
import { BaseTenantEntitySchemaFactory } from '../../../../core/factories';
import { JumpGroupType, RdpQualityMode, SecureAppType } from '../../enums';
import { RemoteRdp } from '../../models';

export class RemoteRdpSchemaFactory implements BaseTenantEntitySchemaFactory<RemoteRdp> {
    public static readonly TABLE_NAME = 'jump_item_remote_rdps';

    public create(tenantId: number): EntitySchema<RemoteRdp> {
        return new EntitySchema<RemoteRdp>({
            name: `${RemoteRdpSchemaFactory.TABLE_NAME}_${tenantId}`,
            tableName: `${RemoteRdpSchemaFactory.TABLE_NAME}_${tenantId}`,
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
                qualityMode: {
                    name: 'quality_mode',
                    type: 'enum',
                    enum: RdpQualityMode,
                    nullable: true,
                },
                mustStartNewConsoleSession: {
                    name: 'must_start_new_console_session',
                    type: 'boolean',
                    nullable: true,
                },
                mustIgnoreUntrustedServerCert: {
                    name: 'must_ignore_untrusted_server_cert',
                    type: 'boolean',
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
                rdpUsername: {
                    name: 'rdp_username',
                    type: 'varchar',
                    nullable: true,
                },
                domain: {
                    name: 'domain',
                    type: 'varchar',
                    nullable: true,
                },
                jumpPolicyId: {
                    name: 'jump_policy_id',
                    type: 'int',
                    nullable: true,
                },
                isSessionForensicsEnabled: {
                    name: 'is_session_forensics_enabled',
                    type: 'boolean',
                    nullable: true,
                },
                sessionPolicyId: {
                    name: 'session_policy_id',
                    type: 'int',
                    nullable: true,
                },
                endpointId: {
                    name: 'endpoint_id',
                    type: 'int',
                    nullable: true,
                },
                secureAppType: {
                    name: 'secure_app_type',
                    type: 'enum',
                    enum: SecureAppType,
                    nullable: true,
                },
                remoteAppName: {
                    name: 'remote_app_name',
                    type: 'text',
                    nullable: true,
                },
                remoteAppParams: {
                    name: 'remote_app_params',
                    type: 'text',
                    nullable: true,
                },
                remoteExePath: {
                    name: 'remote_exe_path',
                    type: 'text',
                    nullable: true,
                },
                remoteExeParams: {
                    name: 'remote_exe_params',
                    type: 'text',
                    nullable: true,
                },
                targetSystem: {
                    name: 'target_system',
                    type: 'varchar',
                    nullable: true,
                },
                credentialType: {
                    name: 'credential_type',
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
            // relations: {
            //     jumpoint: {
            //         type: 'many-to-one',
            //         target: `jumpoints_${tenantId}`,
            //         joinColumn: {
            //             name: 'jumpoint_id',
            //             referencedColumnName: 'id',
            //         },
            //         onDelete: 'CASCADE',
            //         eager: true,
            //     },
            //     jumpGroup: {
            //         type: 'many-to-one',
            //         target: `jump_groups_${tenantId}`,
            //         joinColumn: {
            //             name: 'jump_group_id',
            //             referencedColumnName: 'id',
            //         },
            //         onDelete: 'CASCADE',
            //         eager: true,
            //     },
            //     jumpPolicy: {
            //         type: 'many-to-one',
            //         target: `jump_policies_${tenantId}`,
            //         joinColumn: {
            //             name: 'jump_policy_id',
            //             referencedColumnName: 'id',
            //         },
            //         onDelete: 'SET NULL',
            //         eager: true,
            //     },
            // },
        });
    }
}
