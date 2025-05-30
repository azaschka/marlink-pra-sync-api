import { Expose } from 'class-transformer';
import { IsBoolean, IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class ModifyUserDtoInput {
    @Expose({ name: 'public_display_name' })
    @IsString()
    @IsOptional()
    public publicDisplayName?: string;

    @Expose({ name: 'username' })
    @IsString()
    @IsOptional()
    public username?: string;

    @Expose({ name: 'password' })
    @IsString()
    @IsOptional()
    public password?: string;

    @Expose({ name: 'password_expiration' })
    @IsDateString()
    @IsOptional()
    public passwordExpiration?: Date | null;

    @Expose({ name: 'email_address' })
    @IsString()
    @IsOptional()
    public emailAddress?: string;

    @Expose({ name: 'preferred_email_language' })
    @IsString()
    @IsOptional()
    public preferredEmailLanguage?: string;

    @Expose({ name: 'two_factor_required' })
    @IsOptional()
    @IsBoolean()
    public twoFactorRequired?: boolean;

    @Expose({ name: 'enabled' })
    @IsOptional()
    @IsBoolean()
    public enabled?: boolean;

    @Expose({ name: 'failed_logins' })
    @IsInt()
    @IsOptional()
    public failedLogins?: number;

    @Expose({ name: 'password_reset_next_login' })
    @IsOptional()
    @IsBoolean()
    public passwordResetNextLogin?: boolean;

    public static create(
        publicDisplayName?: string,
        username?: string,
        password?: string,
        passwordExpiration?: Date | null,
        emailAddress?: string,
        preferredEmailLanguage?: string,
        twoFactorRequired?: boolean,
        enabled?: boolean,
        failedLogins?: number,
        passwordResetNextLogin?: boolean,
    ): ModifyUserDtoInput {
        const dto = new ModifyUserDtoInput();
        dto.publicDisplayName = publicDisplayName;
        dto.username = username;
        dto.password = password;
        dto.passwordExpiration = passwordExpiration;
        dto.emailAddress = emailAddress;
        dto.preferredEmailLanguage = preferredEmailLanguage;
        dto.twoFactorRequired = twoFactorRequired;
        dto.enabled = enabled;
        dto.failedLogins = failedLogins;
        dto.passwordResetNextLogin = passwordResetNextLogin;

        return dto;
    }
}
