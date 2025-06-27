import { Column, Entity, OneToMany } from 'typeorm';
import { DateUtility } from '../../../shared/utilities';
import { TeamUserEntity } from '../../../team-user/repositories/entities';
import { Team } from '../../models';

@Entity({ name: 'teams' })
export class TeamEntity implements Team {
    @Column({ name: 'id', type: 'int', unique: true, primary: true, generated: false })
    public id!: number;

    @Column({ name: 'name', type: 'varchar' })
    public name!: string;

    @Column({ name: 'code_name', type: 'varchar', nullable: true })
    public codeName?: string;

    @Column({ name: 'comments', type: 'text', nullable: true })
    public comments?: string | null;

    @Column({ name: 'last_sync_date', type: 'timestamp', precision: 3 })
    public lastSyncDate!: Date;

    @OneToMany(() => TeamUserEntity, (teamUser) => teamUser.team)
    public teamUsers!: TeamUserEntity[];

    public static create(id: number, name: string, codeName?: string, comments?: string | null): TeamEntity {
        const entity = new TeamEntity();
        entity.id = id;
        entity.name = name;
        entity.codeName = codeName;
        entity.comments = comments;
        entity.lastSyncDate = DateUtility.getCurrentUtcDate();

        return entity;
    }
}
