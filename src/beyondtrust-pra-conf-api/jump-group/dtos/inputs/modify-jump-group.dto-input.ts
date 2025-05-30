import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class ModifyJumpGroupDtoInput {
    @IsString()
    @IsOptional()
    public name?: string;

    @Expose({ name: 'code_name' })
    @IsString()
    @IsOptional()
    public codeName?: string;

    @IsString()
    @IsOptional()
    public comments?: string | null;

    public static create(name?: string, codeName?: string, comments?: string | null): ModifyJumpGroupDtoInput {
        const dto = new ModifyJumpGroupDtoInput();
        dto.name = name;
        dto.codeName = codeName;
        dto.comments = comments;

        return dto;
    }
}
