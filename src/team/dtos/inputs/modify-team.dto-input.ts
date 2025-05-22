import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ModifyTeamDtoInput {
    @ApiProperty({ required: true, type: String })
    @IsNotEmpty()
    @IsString()
    public name!: string;

    @ApiProperty({ required: false, type: String })
    @IsOptional()
    @IsString()
    public codeName?: string;

    @ApiProperty({ required: false, type: String, nullable: true })
    @IsOptional()
    @IsString()
    public comments?: string | null;
}
