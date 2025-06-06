import { Expose } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationDtoInput } from '../../../../../shared/dtos/inputs';
import { JumpGroupType } from '../../enums';

export class RetrieveShellJumpsDtoInput extends PaginationDtoInput {
    @Expose({ name: 'name' })
    @IsString()
    @IsOptional()
    public name?: string;

    @Expose({ name: 'hostname' })
    @IsString()
    @IsOptional()
    public hostname?: string;

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
        hostname?: string,
        jumpGroupId?: number,
        jumpGroupType?: JumpGroupType,
        jumpointId?: number,
        tag?: string,
    ): RetrieveShellJumpsDtoInput {
        const dto = new RetrieveShellJumpsDtoInput();
        dto.perPage = perPage;
        dto.currentPage = currentPage;
        dto.name = name;
        dto.hostname = hostname;
        dto.jumpGroupId = jumpGroupId;
        dto.jumpGroupType = jumpGroupType;
        dto.jumpointId = jumpointId;
        dto.tag = tag;

        return dto;
    }
}
