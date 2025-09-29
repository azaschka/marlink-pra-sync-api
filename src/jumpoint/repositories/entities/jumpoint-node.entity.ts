import { DateUtility } from '../../../shared/utilities';
import { JumpointNode } from '../../models';
import { JumpointEntity } from './jumpoint.entity';

export class JumpointNodeEntity implements JumpointNode {
    public id!: number;
    public jumpointId!: number;
    public lastConnectDate?: Date | null;
    public lastDisconnectDate?: Date | null;
    public publicIp!: string;
    public privateIp!: string;
    public hostname!: string;
    public lastSyncDate!: Date;
    public jumpoint?: JumpointEntity;

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
