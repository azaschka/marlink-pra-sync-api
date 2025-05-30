import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class ModifyTeamDtoInput {
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

    public static create(name?: string, codeName?: string, comments?: string | null): ModifyTeamDtoInput {
        const dto = new ModifyTeamDtoInput();
        dto.name = name;
        dto.codeName = codeName;
        dto.comments = comments;

        return dto;
    }
}
