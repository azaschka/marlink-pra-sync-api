import { Expose } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { JumpClientGroupType } from '../../enums';

export class CopyJumpClientDtoInput {
    @Expose({ name: 'jump_group_id' })
    @IsInt()
    @IsNotEmpty()
    public jumpGroupId!: number;

    @Expose({ name: 'jump_group_type' })
    @IsNotEmpty()
    public jumpGroupType!: JumpClientGroupType;

    @IsString()
    @IsNotEmpty()
    public name!: string;
}
