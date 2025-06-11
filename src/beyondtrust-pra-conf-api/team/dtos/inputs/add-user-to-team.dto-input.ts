import { Expose } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { UserTeamRoleType } from '../../enums';

export class AddUserToTeamDtoInput {
    @Expose({ name: 'user_id' })
    @IsInt()
    @IsNotEmpty()
    public userId!: number;

    @IsOptional()
    @IsEnum(UserTeamRoleType)
    public role?: UserTeamRoleType;

    public static create(userId: number, role?: UserTeamRoleType): AddUserToTeamDtoInput {
        const dto = new AddUserToTeamDtoInput();
        dto.userId = userId;
        dto.role = role;
        return dto;
    }
}
