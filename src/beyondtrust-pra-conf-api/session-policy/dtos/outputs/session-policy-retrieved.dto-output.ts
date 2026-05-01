import { Expose } from 'class-transformer';

export class SessionPolicyRetrievedDtoOutput {
    public id!: number;

    @Expose({ name: 'display_name' })
    public displayName!: string;

    @Expose({ name: 'code_name' })
    public codeName!: string;

    public description!: string | null;
}
