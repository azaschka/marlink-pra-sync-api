import { JumpGroupEntity } from '../../../../jump-group/repositories/entities';
import { JumpPolicyEntity } from '../../../../jump-policy/repositories/entities';
import { JumpointEntity } from '../../../../jumpoint/repositories/entities';
import { DateUtility } from '../../../../shared/utilities';
import { JumpGroupType, TunnelType } from '../../enums';
import { ProtocolTunnelJump } from '../../models';

export class ProtocolTunnelJumpEntity implements ProtocolTunnelJump {
    public id!: number;
    public name!: string;
    public jumpointId!: number;
    public hostname!: string;
    public jumpGroupId!: number;
    public jumpGroupType?: JumpGroupType;
    public tag?: string;
    public comments?: string;
    public jumpPolicyId?: number | null;
    public sessionPolicyId?: number | null;
    public tunnelListenAddress?: string;
    public tunnelDefinitions?: string;
    public tunnelType?: TunnelType;
    public username?: string;
    public database?: string;
    public url?: string;
    public caCertificates?: string;
    public lastSyncDate!: Date;
    public jumpoint?: JumpointEntity;
    public jumpGroup?: JumpGroupEntity;
    public jumpPolicy?: JumpPolicyEntity;

    public static create(
        id: number,
        name: string,
        jumpointId: number,
        hostname: string,
        jumpGroupId: number,
        jumpGroupType?: JumpGroupType,
        tag?: string,
        comments?: string,
        jumpPolicyId?: number | null,
        sessionPolicyId?: number | null,
        tunnelListenAddress?: string,
        tunnelDefinitions?: string,
        tunnelType?: TunnelType,
        username?: string,
        database?: string,
        url?: string,
        caCertificates?: string,
    ): ProtocolTunnelJumpEntity {
        const entity = new ProtocolTunnelJumpEntity();
        entity.id = id;
        entity.name = name;
        entity.jumpointId = jumpointId;
        entity.hostname = hostname;
        entity.jumpGroupId = jumpGroupId;
        entity.jumpGroupType = jumpGroupType;
        entity.tag = tag;
        entity.comments = comments;
        entity.jumpPolicyId = jumpPolicyId;
        entity.sessionPolicyId = sessionPolicyId;
        entity.tunnelListenAddress = tunnelListenAddress;
        entity.tunnelDefinitions = tunnelDefinitions;
        entity.tunnelType = tunnelType;
        entity.username = username;
        entity.database = database;
        entity.url = url;
        entity.caCertificates = caCertificates;
        entity.lastSyncDate = DateUtility.getCurrentUtcDate();

        return entity;
    }
}
