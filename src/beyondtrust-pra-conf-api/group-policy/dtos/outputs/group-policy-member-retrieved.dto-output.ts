import { Expose } from 'class-transformer';

export class GroupPolicyMemberRetrievedDtoOutput {
    @Expose({ name: 'id' })
    public id!: number;

    @Expose({ name: 'user_id' })
    public userId!: number;

    @Expose({ name: 'security_provider_id' })
    public securityProviderId!: number;

    @Expose({ name: 'distinguished_name' })
    public distinguishedName?: string;

    @Expose({ name: 'group_name' })
    public groupName?: string;
}
