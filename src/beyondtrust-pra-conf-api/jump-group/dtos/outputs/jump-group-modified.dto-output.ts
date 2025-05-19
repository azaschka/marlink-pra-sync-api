import { Expose } from 'class-transformer';

export class JumpGroupModifiedDtoOutput {
    public id!: number;
    public name!: string;

    @Expose({ name: 'code_name' })
    public codeName?: string;

    public comments?: string | null;
}
