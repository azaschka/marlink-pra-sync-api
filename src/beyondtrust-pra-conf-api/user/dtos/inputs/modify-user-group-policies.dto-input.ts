import { Expose } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty } from 'class-validator';

export class ModifyUserGroupPoliciesDtoInput {
    @Expose({ name: 'added' })
    @IsArray()
    @IsInt({ each: true })
    @IsNotEmpty()
    public added!: number[];

    @Expose({ name: 'removed' })
    @IsArray()
    @IsInt({ each: true })
    @IsNotEmpty()
    public removed!: number[];

    public static create(added: number[], removed: number[]): ModifyUserGroupPoliciesDtoInput {
        const dto = new ModifyUserGroupPoliciesDtoInput();
        dto.added = added;
        dto.removed = removed;

        return dto;
    }
}
