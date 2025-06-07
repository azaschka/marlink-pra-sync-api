import { Expose } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationDtoInput } from '../../../../../shared/dtos/inputs';
import { JumpGroupType } from '../../enums';

export class RetrieveWebJumpsDtoInput extends PaginationDtoInput {
    @Expose({ name: 'name' })
    @IsString()
    @IsOptional()
    public name?: string;

    @Expose({ name: 'url' })
    @IsString()
    @IsOptional()
    public url?: string;

    @Expose({ name: 'jump_group_id' })
    @IsInt()
    @IsOptional()
    public jumpGroupId?: number;

    @Expose({ name: 'jump_group_type' })
    @IsOptional()
    @IsEnum(JumpGroupType)
    public jumpGroupType?: JumpGroupType;

    @Expose({ name: 'jumpoint_id' })
    @IsInt()
    @IsOptional()
    public jumpointId?: number;

    @Expose({ name: 'tag' })
    @IsOptional()
    @IsString()
    public tag?: string;

    public static create(
        perPage: number,
        currentPage: number,
        name?: string,
        url?: string,
        jumpGroupId?: number,
        jumpGroupType?: JumpGroupType,
        jumpointId?: number,
        tag?: string,
    ): RetrieveWebJumpsDtoInput {
        const dto = new RetrieveWebJumpsDtoInput();
        dto.perPage = perPage;
        dto.currentPage = currentPage;
        dto.name = name;
        dto.url = url;
        dto.jumpGroupId = jumpGroupId;
        dto.jumpGroupType = jumpGroupType;
        dto.jumpointId = jumpointId;
        dto.tag = tag;

        return dto;
    }
}
