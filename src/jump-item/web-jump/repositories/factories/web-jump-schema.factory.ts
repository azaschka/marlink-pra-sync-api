import { EntitySchema } from 'typeorm';
import { BaseTenantEntitySchemaFactory } from '../../../../core/factories';
import { JumpGroupType, WebJumpUsernameFormatType } from '../../enums';
import { WebJump } from '../../models';

export class WebJumpSchemaFactory implements BaseTenantEntitySchemaFactory<WebJump> {
    public static readonly TABLE_NAME = 'jump_item_web_jumps';

    public create(tenantId: number): EntitySchema<WebJump> {
        return new EntitySchema<WebJump>({
            name: `${WebJumpSchemaFactory.TABLE_NAME}_${tenantId}`,
            tableName: `${WebJumpSchemaFactory.TABLE_NAME}_${tenantId}`,
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
                url: {
                    name: 'url',
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
                usernameFormatType: {
                    name: 'username_format_type',
                    type: 'enum',
                    enum: WebJumpUsernameFormatType,
                    nullable: true,
                },
                mustVerifyCertificate: {
                    name: 'must_verify_certificate',
                    type: 'boolean',
                    nullable: true,
                },
                authenticationTimeoutInSeconds: {
                    name: 'authentication_timeout_in_seconds',
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
                usernameField: {
                    name: 'username_field',
                    type: 'varchar',
                    nullable: true,
                },
                passwordField: {
                    name: 'password_field',
                    type: 'varchar',
                    nullable: true,
                },
                submitField: {
                    name: 'submit_field',
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
