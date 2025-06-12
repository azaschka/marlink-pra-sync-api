import { Expose } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class AddJumpointToGroupPolicyDtoInput {
    @Expose({ name: 'jumpoint_id' })
    @IsInt()
    @IsNotEmpty()
    public jumpointId!: number;

    public static create(jumpointId: number): AddJumpointToGroupPolicyDtoInput {
        const dto = new AddJumpointToGroupPolicyDtoInput();
        dto.jumpointId = jumpointId;
        return dto;
    }
}
