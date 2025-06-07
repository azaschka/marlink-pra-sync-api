import { Expose } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { JumpGroupType } from '../../enums';

export class CopyWebJumpDtoInput {
    @Expose({ name: 'name' })
    @IsString()
    @IsNotEmpty()
    public name!: string;

    @Expose({ name: 'jump_group_id' })
    @IsInt()
    @IsNotEmpty()
    public jumpGroupId!: number;

    @Expose({ name: 'jump_group_type' })
    @IsNotEmpty()
    @IsEnum(JumpGroupType)
    public jumpGroupType!: JumpGroupType;

    public static create(name: string, jumpGroupId: number, jumpGroupType: JumpGroupType): CopyWebJumpDtoInput {
        const dto = new CopyWebJumpDtoInput();
        dto.name = name;
        dto.jumpGroupId = jumpGroupId;
        dto.jumpGroupType = jumpGroupType;

        return dto;
    }
}
