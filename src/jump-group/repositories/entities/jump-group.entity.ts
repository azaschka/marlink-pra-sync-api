import { Column, Entity } from 'typeorm';
import { DateUtility } from '../../../shared/utilities';
import { JumpGroup } from '../../models';

@Entity({ name: 'jump_groups' })
export class JumpGroupEntity implements JumpGroup {
    @Column({ name: 'id', type: 'int', unique: true, primary: true, generated: false })
    public id!: number;

    @Column({ name: 'name', type: 'varchar' })
    public name!: string;

    @Column({ name: 'code_name', type: 'varchar', nullable: true })
    public codeName?: string;

    @Column({ name: 'comments', type: 'varchar', nullable: true })
    public comments?: string | null;

    @Column({ name: 'last_sync_date', type: 'timestamp', precision: 3 })
    public lastSyncDate!: Date;

    public static create(id: number, name: string, codeName?: string, comments?: string | null): JumpGroupEntity {
        const entity = new JumpGroupEntity();
        entity.id = id;
        entity.name = name;
        entity.codeName = codeName;
        entity.comments = comments;
        entity.lastSyncDate = DateUtility.getCurrentUtcDate();

        return entity;
    }
}
