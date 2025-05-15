import { Column, Entity } from 'typeorm';
import { Team } from '../../models';

@Entity({ name: 'teams' })
export class TeamEntity implements Team {
    @Column({ name: 'id', type: 'int', unique: true, primary: true, generated: false })
    public id!: number;

    @Column({ name: 'name', type: 'varchar', length: 255 })
    public name!: string;

    @Column({ name: 'code_name', type: 'varchar', length: 255, nullable: true })
    public codeName?: string;

    @Column({ name: 'comments', type: 'varchar', length: 255, nullable: true })
    public comments?: string | null;

    public static create(id: number, name: string, codeName?: string, comments?: string | null): TeamEntity {
        const entity = new TeamEntity();
        entity.id = id;
        entity.name = name;
        entity.codeName = codeName;
        entity.comments = comments;

        return entity;
    }
}
