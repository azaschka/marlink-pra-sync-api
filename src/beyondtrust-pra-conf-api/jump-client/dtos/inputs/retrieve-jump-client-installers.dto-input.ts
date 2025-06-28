import { Expose } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationDtoInput } from '../../../../shared/dtos/inputs';
import { JumpClientConnectionType, JumpClientGroupType } from '../../enums';

export class RetrieveJumpClientInstallersDtoInput extends PaginationDtoInput {
    @IsString()
    @IsOptional()
    public name?: string;

    @IsString()
    @IsOptional()
    public hostname?: string;

    @IsString()
    @IsOptional()
    public fqdn?: string;

    @IsString()
    @IsOptional()
    public tag?: string;

    @Expose({ name: 'jump_group_id' })
    @IsInt()
    @IsOptional()
    public jumpGroupId?: number;

    @Expose({ name: 'jump_group_type' })
    @IsEnum(JumpClientGroupType)
    @IsOptional()
    public jumpGroupType?: JumpClientGroupType;

    @Expose({ name: 'connection_type' })
    @IsEnum(JumpClientConnectionType)
    @IsOptional()
    public connectionType?: JumpClientConnectionType;

    public static create(
        perPage: number,
        currentPage: number,
        name?: string,
        hostname?: string,
        fqdn?: string,
        tag?: string,
        jumpGroupId?: number,
        jumpGroupType?: JumpClientGroupType,
        connectionType?: JumpClientConnectionType,
    ): RetrieveJumpClientInstallersDtoInput {
        const dto = new RetrieveJumpClientInstallersDtoInput();
        dto.perPage = perPage;
        dto.currentPage = currentPage;
        dto.name = name;
        dto.hostname = hostname;
        dto.fqdn = fqdn;
        dto.tag = tag;
        dto.jumpGroupId = jumpGroupId;
        dto.jumpGroupType = jumpGroupType;
        dto.connectionType = connectionType;

        return dto;
    }
}
