import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTeamDtoInput {
    @IsString()
    @IsNotEmpty()
    public name!: string;

    @Expose({ name: 'code_name' })
    @IsString()
    @IsOptional()
    public codeName?: string;

    @IsString()
    @IsOptional()
    public comments?: string | null;

    public static create(name: string, codeName?: string, comments?: string | null): CreateTeamDtoInput {
        const dto = new CreateTeamDtoInput();
        dto.name = name;
        dto.codeName = codeName;
        dto.comments = comments;

        return dto;
    }
}
