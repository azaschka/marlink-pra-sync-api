import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { UserTeamRoleType } from '../../enums';

export class AddUserToTeamDtoInput {
    @ApiProperty({ required: true, type: Number })
    @IsInt()
    @IsNotEmpty()
    public userId!: number;

    @ApiProperty({ required: false, enum: UserTeamRoleType })
    @IsOptional()
    @IsEnum(UserTeamRoleType)
    public roleType?: UserTeamRoleType;
}
