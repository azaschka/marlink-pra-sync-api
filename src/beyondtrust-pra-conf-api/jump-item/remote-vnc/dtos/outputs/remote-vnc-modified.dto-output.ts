import { Expose } from 'class-transformer';
import { JumpGroupType } from '../../enums';

export class RemoteVncModifiedDtoOutput {
    @Expose({ name: 'id' })
    public id!: number;

    @Expose({ name: 'name' })
    public name!: string;

    @Expose({ name: 'jumpoint_id' })
    public jumpointId!: number;

    @Expose({ name: 'hostname' })
    public hostname!: string;

    @Expose({ name: 'port' })
    public port?: number;

    @Expose({ name: 'jump_group_id' })
    public jumpGroupId!: number;

    @Expose({ name: 'jump_group_type' })
    public jumpGroupType?: JumpGroupType;

    @Expose({ name: 'tag' })
    public tag?: string;

    @Expose({ name: 'comments' })
    public comments?: string;

    @Expose({ name: 'jump_policy_id' })
    public jumpPolicyId?: number | null;

    @Expose({ name: 'session_policy_id' })
    public sessionPolicyId?: number | null;
}
