import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class RetrieveJumpGroupsDtoInput {
    @ApiProperty({ required: false, type: Number, default: 5 })
    @Type(() => Number)
    @IsInt()
    @IsOptional()
    public pageSize: number = 5;

    @ApiProperty({ required: false, type: Number, default: 1 })
    @Type(() => Number)
    @IsInt()
    @IsOptional()
    public pageNumber: number = 1;

    @ApiProperty({ required: false, type: String })
    @IsString()
    @IsOptional()
    public name?: string;

    @ApiProperty({ required: false, type: String })
    @IsString()
    @IsOptional()
    public codeName?: string;
}
