import { Expose } from 'class-transformer';

export class JumpGroupCreatedDtoOutput {
    public id!: number;
    public name!: string;

    @Expose({ name: 'code_name' })
    public codeName?: string;

    public comments?: string | null;
}
