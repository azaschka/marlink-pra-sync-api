import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty } from 'class-validator';

export class ModifyUserGroupPoliciesDtoInput {
    @ApiProperty({ required: true, type: [Number] })
    @IsArray()
    @IsInt({ each: true })
    @IsNotEmpty()
    public groupPolicyIdsToAdd!: number[];

    @ApiProperty({ required: true, type: [Number] })
    @IsArray()
    @IsInt({ each: true })
    @IsNotEmpty()
    public groupPolicyIdsToRemove!: number[];
}
