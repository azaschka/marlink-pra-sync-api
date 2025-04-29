import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDtoInput {
    @ApiProperty({ required: true, type: String })
    @IsNotEmpty()
    @IsString()
    public publicDisplayName!: string;

    @ApiProperty({ required: true, type: String })
    @IsNotEmpty()
    @IsString()
    public username!: string;

    @ApiProperty({ required: false, type: String })
    @IsOptional()
    @IsString()
    public password?: string;

    @ApiProperty({ required: false, type: Date, nullable: true })
    @IsOptional()
    @Type(() => Date)
    public passwordExpirationDate?: Date | null;

    @ApiProperty({ required: false, type: String })
    @IsOptional()
    @IsString()
    public email?: string;

    @ApiProperty({ required: false, type: String })
    @IsOptional()
    @IsString()
    public preferredEmailLanguage?: string;

    @ApiProperty({ required: false, type: Boolean })
    @IsOptional()
    @IsBoolean()
    public isTwoFactorAuthRequired?: boolean;

    @ApiProperty({ required: false, type: Boolean })
    @IsOptional()
    @IsBoolean()
    public isLoginAllowed?: boolean;

    @ApiProperty({ required: false, type: Number })
    @IsOptional()
    @IsInt()
    public failedLoginAttempts?: number;

    @ApiProperty({ required: false, type: Boolean })
    @IsOptional()
    @IsBoolean()
    public mustResetPasswordOnNextLogin?: boolean;
}
