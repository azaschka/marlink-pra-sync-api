import { Expose } from 'class-transformer';

export class GroupPolicyJumpointRetrievedDtoOutput {
    @Expose({ name: 'jumpoint_id' })
    public jumpointId!: number;
}
