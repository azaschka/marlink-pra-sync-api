import { Expose } from 'class-transformer';

export class JumpointAddedToGroupPolicyDtoOutput {
    @Expose({ name: 'jumpoint_id' })
    public jumpointId!: number;
}
