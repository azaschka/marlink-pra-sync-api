import { Expose } from 'class-transformer';
import { JumpGroupType, ShellJumpProtocolType, ShellJumpTerminalType } from '../../enums';

export class ShellJumpModifiedDtoOutput {
    @Expose({ name: 'id' })
    public id!: number;

    @Expose({ name: 'name' })
    public name!: string;

    @Expose({ name: 'jumpoint_id' })
    public jumpointId!: number;

    @Expose({ name: 'hostname' })
    public hostname!: string;

    @Expose({ name: 'protocol' })
    public protocol!: ShellJumpProtocolType;

    @Expose({ name: 'port' })
    public port?: number;

    @Expose({ name: 'jump_group_id' })
    public jumpGroupId!: number;

    @Expose({ name: 'jump_group_type' })
    public jumpGroupType?: JumpGroupType;

    @Expose({ name: 'terminal' })
    public terminal?: ShellJumpTerminalType;

    @Expose({ name: 'keep_alive' })
    public keepAlive?: number;

    @Expose({ name: 'tag' })
    public tag?: string;

    @Expose({ name: 'comments' })
    public comments?: string;

    @Expose({ name: 'jump_policy_id' })
    public jumpPolicyId?: number | null;

    @Expose({ name: 'username' })
    public username?: string;

    @Expose({ name: 'session_policy_id' })
    public sessionPolicyId?: number | null;
}
