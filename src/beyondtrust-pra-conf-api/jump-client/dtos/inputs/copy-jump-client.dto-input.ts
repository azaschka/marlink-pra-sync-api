import { Expose } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { JumpClientGroupType } from '../../enums';

export class CopyJumpClientDtoInput {
    @Expose({ name: 'jump_group_id' })
    @IsInt()
    @IsNotEmpty()
    public jumpGroupId!: number;

    @Expose({ name: 'jump_group_type' })
    @IsEnum(JumpClientGroupType)
    @IsNotEmpty()
    public jumpGroupType!: JumpClientGroupType;

    @IsString()
    @IsNotEmpty()
    public name!: string;

    public static create(
        jumpGroupId: number,
        jumpGroupType: JumpClientGroupType,
        name: string,
    ): CopyJumpClientDtoInput {
        const dto = new CopyJumpClientDtoInput();
        dto.jumpGroupId = jumpGroupId;
        dto.jumpGroupType = jumpGroupType;
        dto.name = name;

        return dto;
    }
}
