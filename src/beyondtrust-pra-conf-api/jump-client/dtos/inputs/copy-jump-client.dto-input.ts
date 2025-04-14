import { Expose } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CopyJumpClientDtoInput {
    @Expose({ name: 'jump_group_id' })
    @IsInt()
    @IsNotEmpty()
    public jumpGroupId!: number;

    @Expose({ name: 'jump_group_type' })
    @IsNotEmpty()
    public jumpGroupType!: 'shared'; // TODO

    @IsString()
    @IsNotEmpty()
    public name!: string;
}
