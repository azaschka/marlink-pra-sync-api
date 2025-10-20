import { EntitySchema } from 'typeorm';
import { BaseTenantEntitySchemaFactory } from '../../../../core/factories';
import { JumpGroupType } from '../../enums';
import { RemoteVnc } from '../../models';

export class RemoteVncSchemaFactory implements BaseTenantEntitySchemaFactory<RemoteVnc> {
    public static readonly TABLE_NAME = 'jump_item_remote_vncs';

    public create(tenantId: number): EntitySchema<RemoteVnc> {
        return new EntitySchema<RemoteVnc>({
            name: `${RemoteVncSchemaFactory.TABLE_NAME}_${tenantId}`,
            tableName: `${RemoteVncSchemaFactory.TABLE_NAME}_${tenantId}`,
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
                lastSyncDate: {
                    name: 'last_sync_date',
                    type: 'timestamp',
                    precision: 3,
                    nullable: false,
                    updateDate: true,
                },
            },
            relations: {
                jumpoint: {
                    type: 'many-to-one',
                    target: `jumpoints_${tenantId}`,
                    joinColumn: {
                        name: 'jumpoint_id',
                    },
                    inverseSide: 'remoteVncs',
                    onDelete: 'CASCADE',
                    eager: true,
                },
                jumpGroup: {
                    type: 'many-to-one',
                    target: `jump_groups_${tenantId}`,
                    joinColumn: {
                        name: 'jump_group_id',
                    },
                    inverseSide: 'remoteVncs',
                    onDelete: 'CASCADE',
                    eager: true,
                },
                jumpPolicy: {
                    type: 'many-to-one',
                    target: `jump_policies_${tenantId}`,
                    joinColumn: {
                        name: 'jump_policy_id',
                    },
                    inverseSide: 'remoteVncs',
                    onDelete: 'SET NULL',
                    eager: true,
                    nullable: true,
                },
            },
        });
    }
}
