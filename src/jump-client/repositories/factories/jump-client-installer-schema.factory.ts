import { EntitySchema } from 'typeorm';
import { BaseTenantEntitySchemaFactory } from '../../../core/factories';
import { JumpClientConnectionType, JumpClientGroupType } from '../../enums';
import { JumpClientInstaller } from '../../models';

export class JumpClientInstallerSchemaFactory implements BaseTenantEntitySchemaFactory<JumpClientInstaller> {
    public static readonly TABLE_NAME = 'jump_client_installers';

    public create(tenantId: number): EntitySchema<JumpClientInstaller> {
        return new EntitySchema<JumpClientInstaller>({
            name: `${JumpClientInstallerSchemaFactory.TABLE_NAME}_${tenantId}`,
            tableName: `${JumpClientInstallerSchemaFactory.TABLE_NAME}_${tenantId}`,
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
                connectionType: {
                    name: 'connection_type',
                    type: 'enum',
                    enum: JumpClientConnectionType,
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
                shouldElevateInstall: {
                    name: 'should_elevate_install',
                    type: 'boolean',
                    nullable: true,
                },
                shouldElevatePrompt: {
                    name: 'should_elevate_prompt',
                    type: 'boolean',
                    nullable: true,
                },
                canOverrideJumpGroup: {
                    name: 'can_override_jump_group',
                    type: 'boolean',
                    nullable: true,
                },
                canOverrideJumpPolicy: {
                    name: 'can_override_jump_policy',
                    type: 'boolean',
                    nullable: true,
                },
                canOverrideName: {
                    name: 'can_override_name',
                    type: 'boolean',
                    nullable: true,
                },
                canOverrideTag: {
                    name: 'can_override_tag',
                    type: 'boolean',
                    nullable: true,
                },
                canOverrideComments: {
                    name: 'can_override_comments',
                    type: 'boolean',
                    nullable: true,
                },
                canOverrideSessionPolicy: {
                    name: 'can_override_session_policy',
                    type: 'boolean',
                    nullable: true,
                },
                installerId: {
                    name: 'installer_id',
                    type: 'varchar',
                    nullable: true,
                },
                keyInfo: {
                    name: 'key_info',
                    type: 'json',
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
        });
    }
}
