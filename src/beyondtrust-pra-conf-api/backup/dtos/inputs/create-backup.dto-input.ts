import { IsOptional, IsString } from 'class-validator';

export class CreateBackupDtoInput {
    @IsString()
    @IsOptional()
    public password?: string;

    public static create(password?: string): CreateBackupDtoInput {
        const dto = new CreateBackupDtoInput();
        dto.password = password;

        return dto;
    }
}
