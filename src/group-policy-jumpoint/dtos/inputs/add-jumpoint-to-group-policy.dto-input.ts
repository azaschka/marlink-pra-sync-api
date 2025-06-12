import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class AddJumpointToGroupPolicyDtoInput {
    @ApiProperty({ required: true, type: Number })
    @IsInt()
    @IsNotEmpty()
    public jumpointId!: number;
}
