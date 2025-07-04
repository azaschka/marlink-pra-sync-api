import { Expose } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddMemberToGroupPolicyDtoInput {
    @Expose({ name: 'user_id' })
    @IsInt()
    @IsNotEmpty()
    public userId!: number;

    @Expose({ name: 'security_provider_id' })
    @IsInt()
    @IsNotEmpty()
    public securityProviderId!: number;

    @Expose({ name: 'distinguished_name' })
    @IsString()
    @IsOptional()
    public distinguishedName?: string;

    @Expose({ name: 'group_name' })
    @IsString()
    @IsOptional()
    public groupName?: string;

    public static create(
        userId: number,
        securityProviderId: number,
        distinguishedName?: string,
        groupName?: string,
    ): AddMemberToGroupPolicyDtoInput {
        const dto = new AddMemberToGroupPolicyDtoInput();
        dto.userId = userId;
        dto.securityProviderId = securityProviderId;
        dto.distinguishedName = distinguishedName;
        dto.groupName = groupName;

        return dto;
    }
}
