import { JumpGroupEntity } from '../../../../jump-group/repositories/entities';
import { JumpPolicyEntity } from '../../../../jump-policy/repositories/entities';
import { JumpointEntity } from '../../../../jumpoint/repositories/entities';
import { DateUtility } from '../../../../shared/utilities';
import { JumpGroupType, ShellJumpProtocolType, ShellJumpTerminalType } from '../../enums';
import { ShellJump } from '../../models';

export class ShellJumpEntity implements ShellJump {
    public id!: number;
    public name!: string;
    public jumpointId!: number;
    public hostname!: string;
    public protocolType!: ShellJumpProtocolType;
    public port?: number;
    public jumpGroupId!: number;
    public jumpGroupType?: JumpGroupType;
    public terminalType?: ShellJumpTerminalType;
    public keepAliveIdleSessionInSeconds?: number;
    public tag?: string;
    public comments?: string;
    public jumpPolicyId?: number | null;
    public username?: string;
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
        protocolType: ShellJumpProtocolType,
        port: number | undefined,
        jumpGroupId: number,
        jumpGroupType?: JumpGroupType,
        terminalType?: ShellJumpTerminalType,
        keepAliveIdleSessionInSeconds?: number,
        tag?: string,
        comments?: string,
        jumpPolicyId?: number | null,
        username?: string,
        sessionPolicyId?: number | null,
    ): ShellJumpEntity {
        const entity = new ShellJumpEntity();
        entity.id = id;
        entity.name = name;
        entity.jumpointId = jumpointId;
        entity.hostname = hostname;
        entity.protocolType = protocolType;
        entity.port = port;
        entity.jumpGroupId = jumpGroupId;
        entity.jumpGroupType = jumpGroupType;
        entity.terminalType = terminalType;
        entity.keepAliveIdleSessionInSeconds = keepAliveIdleSessionInSeconds;
        entity.tag = tag;
        entity.comments = comments;
        entity.jumpPolicyId = jumpPolicyId;
        entity.username = username;
        entity.sessionPolicyId = sessionPolicyId;
        entity.lastSyncDate = DateUtility.getCurrentUtcDate();

        return entity;
    }
}
