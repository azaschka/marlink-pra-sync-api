import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { DateUtility } from '../../../shared/utilities';
import { JumpointNode } from '../../models';
import { JumpointEntity } from './jumpoint.entity';

@Entity({ name: 'jumpoint-nodes' })
export class JumpointNodeEntity implements JumpointNode {
    @PrimaryColumn({ name: 'id', type: 'int' })
    public id!: number;

    @PrimaryColumn({ name: 'jumpoint_id', type: 'int' })
    public jumpointId!: number;

    @Column({ name: 'last_connect_date', type: 'timestamp', nullable: true })
    public lastConnectDate?: Date | null;

    @Column({ name: 'last_disconnect_date', type: 'timestamp', nullable: true })
    public lastDisconnectDate?: Date | null;

    @Column({ name: 'public_ip', type: 'varchar' })
    public publicIp!: string;

    @Column({ name: 'private_ip', type: 'varchar' })
    public privateIp!: string;

    @Column({ name: 'hostname', type: 'varchar' })
    public hostname!: string;

    @Column({ name: 'last_sync_date', type: 'timestamp', precision: 3 })
    public lastSyncDate!: Date;

    @ManyToOne(() => JumpointEntity, (jumpoint) => jumpoint.jumpointNodes, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'jumpoint_id' })
    public jumpoint!: JumpointEntity;

    public static create(
        id: number,
        jumpointId: number,
        lastConnectDate: Date | null | undefined,
        lastDisconnectDate: Date | null | undefined,
        publicIp: string,
        privateIp: string,
        hostname: string,
    ): JumpointNodeEntity {
        const entity = new JumpointNodeEntity();
        entity.id = id;
        entity.jumpointId = jumpointId;
        entity.lastConnectDate = lastConnectDate;
        entity.lastDisconnectDate = lastDisconnectDate;
        entity.publicIp = publicIp;
        entity.privateIp = privateIp;
        entity.hostname = hostname;
        entity.lastSyncDate = DateUtility.getCurrentUtcDate();

        return entity;
    }
}
