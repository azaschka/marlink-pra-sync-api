import { EntitySchema } from 'typeorm';
import { BaseTenantEntitySchemaFactory } from '../../../core/factories';
import { JumpointNode } from '../../models';

export class JumpointNodeSchemaFactory implements BaseTenantEntitySchemaFactory<JumpointNode> {
    public static readonly TABLE_NAME = 'jumpoint_nodes';

    public create(tenantId: number): EntitySchema<JumpointNode> {
        return new EntitySchema<JumpointNode>({
            name: `${JumpointNodeSchemaFactory.TABLE_NAME}_${tenantId}`,
            tableName: `${JumpointNodeSchemaFactory.TABLE_NAME}_${tenantId}`,
            columns: {
                id: {
                    name: 'id',
                    type: 'int',
                    primary: true,
                },
                jumpointId: {
                    name: 'jumpoint_id',
                    type: 'int',
                    primary: true,
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
                publicIp: {
                    name: 'public_ip',
                    type: 'varchar',
                    nullable: false,
                },
                privateIp: {
                    name: 'private_ip',
                    type: 'varchar',
                    nullable: false,
                },
                hostname: {
                    name: 'hostname',
                    type: 'varchar',
                    nullable: false,
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
            //     },
            // },
        });
    }
}
