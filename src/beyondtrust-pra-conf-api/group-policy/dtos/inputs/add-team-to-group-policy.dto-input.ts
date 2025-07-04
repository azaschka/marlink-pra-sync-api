import { Expose } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { GroupPolicyTeamRoleType } from '../../enums';

export class AddTeamToGroupPolicyDtoInput {
    @Expose({ name: 'team_id' })
    @IsInt()
    @IsNotEmpty()
    public teamId!: number;

    @Expose({ name: 'role' })
    @IsEnum(GroupPolicyTeamRoleType)
    @IsOptional()
    public role?: GroupPolicyTeamRoleType;

    public static create(teamId: number, role?: GroupPolicyTeamRoleType): AddTeamToGroupPolicyDtoInput {
        const dto = new AddTeamToGroupPolicyDtoInput();
        dto.teamId = teamId;
        dto.role = role;

        return dto;
    }
}
