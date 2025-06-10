import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { JumpGroupType } from '../../enums';

export class RetrieveShellJumpsDtoInput {
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
    public hostname?: string;

    @ApiProperty({ required: false, type: Number })
    @IsInt()
    @IsOptional()
    public jumpGroupId?: number;

    @ApiProperty({ required: false, enum: JumpGroupType })
    @IsEnum(JumpGroupType)
    @IsOptional()
    public jumpGroupType?: JumpGroupType;

    @ApiProperty({ required: false, type: Number })
    @IsInt()
    @IsOptional()
    public jumpointId?: number;

    @ApiProperty({ required: false, type: String })
    @IsString()
    @IsOptional()
    public tag?: string;
}
