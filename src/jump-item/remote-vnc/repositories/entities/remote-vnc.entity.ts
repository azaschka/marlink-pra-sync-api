import { JumpGroupEntity } from '../../../../jump-group/repositories/entities';
import { JumpPolicyEntity } from '../../../../jump-policy/repositories/entities';
import { JumpointEntity } from '../../../../jumpoint/repositories/entities';
import { DateUtility } from '../../../../shared/utilities';
import { JumpGroupType } from '../../enums';
import { RemoteVnc } from '../../models';

export class RemoteVncEntity implements RemoteVnc {
    public id!: number;
    public name!: string;
    public jumpointId!: number;
    public hostname!: string;
    public port?: number;
    public jumpGroupId!: number;
    public jumpGroupType?: JumpGroupType;
    public tag?: string;
    public comments?: string;
    public jumpPolicyId?: number | null;
    public sessionPolicyId?: number | null;
    public lastSyncDate!: Date;
    public jumpoint?: JumpointEntity;
    public jumpGroup?: JumpGroupEntity;
    public jumpPolicy?: JumpPolicyEntity;

    public static create(
        id: number,
        name: string,
        jumpointId: number,
        hostname: string,
        port: number | undefined,
        jumpGroupId: number,
        jumpGroupType?: JumpGroupType,
        tag?: string,
        comments?: string,
        jumpPolicyId?: number | null,
        sessionPolicyId?: number | null,
    ): RemoteVncEntity {
        const entity = new RemoteVncEntity();
        entity.id = id;
        entity.name = name;
        entity.jumpointId = jumpointId;
        entity.hostname = hostname;
        entity.port = port;
        entity.jumpGroupId = jumpGroupId;
        entity.jumpGroupType = jumpGroupType;
        entity.tag = tag;
        entity.comments = comments;
        entity.jumpPolicyId = jumpPolicyId;
        entity.sessionPolicyId = sessionPolicyId;
        entity.lastSyncDate = DateUtility.getCurrentUtcDate();

        return entity;
    }
}
