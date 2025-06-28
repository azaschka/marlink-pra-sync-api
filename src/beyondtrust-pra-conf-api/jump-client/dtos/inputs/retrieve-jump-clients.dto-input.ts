import { Expose } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { PaginationDtoInput } from '../../../../shared/dtos/inputs';
import { JumpClientConnectionType, JumpClientGroupType } from '../../enums';

export class RetrieveJumpClientsDtoInput extends PaginationDtoInput {
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

    @Expose({ name: 'console_user' })
    @IsString()
    @IsOptional()
    public consoleUser?: string;

    @Expose({ name: 'public_ip' })
    @IsString()
    @IsOptional()
    public publicIp?: string;

    @Expose({ name: 'private_ip' })
    @IsString()
    @IsOptional()
    public privateIp?: string;

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
        consoleUser?: string,
        publicIp?: string,
        privateIp?: string,
        connectionType?: JumpClientConnectionType,
    ): RetrieveJumpClientsDtoInput {
        const dto = new RetrieveJumpClientsDtoInput();
        dto.perPage = perPage;
        dto.currentPage = currentPage;
        dto.name = name;
        dto.hostname = hostname;
        dto.fqdn = fqdn;
        dto.tag = tag;
        dto.jumpGroupId = jumpGroupId;
        dto.jumpGroupType = jumpGroupType;
        dto.consoleUser = consoleUser;
        dto.publicIp = publicIp;
        dto.privateIp = privateIp;
        dto.connectionType = connectionType;

        return dto;
    }
}
