import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { DateUtility } from '../../../shared/utilities';
import { TeamEntity } from '../../../team/repositories/entities';
import { UserEntity } from '../../../user/repositories/entities';
import { UserTeamRoleType } from '../../enums';

@Entity({ name: 'team_users' })
export class TeamUserEntity {
    @PrimaryColumn({ name: 'team_id', type: 'int' })
    public teamId!: number;

    @PrimaryColumn({ name: 'user_id', type: 'int' })
    public userId!: number;

    @Column({
        name: 'role_type',
        type: 'enum',
        enum: UserTeamRoleType,
    })
    public roleType!: UserTeamRoleType;

    @ManyToOne(() => TeamEntity, (team) => team.teamUsers)
    @JoinColumn({ name: 'team_id' })
    public team!: TeamEntity;

    @ManyToOne(() => UserEntity, (user) => user.teamUsers)
    @JoinColumn({ name: 'user_id' })
    public user!: UserEntity;

    @Column({ name: 'last_sync_date', type: 'timestamp', precision: 3 })
    public lastSyncDate!: Date;

    public static create(teamId: number, userId: number, roleType: UserTeamRoleType): TeamUserEntity {
        const entity = new TeamUserEntity();
        entity.teamId = teamId;
        entity.userId = userId;
        entity.roleType = roleType;
        entity.team = { id: teamId } as TeamEntity; // Stub TeamEntity with only the id
        entity.user = { id: userId } as UserEntity; // Stub UserEntity with only the id
        entity.lastSyncDate = DateUtility.getCurrentUtcDate();

        return entity;
    }
}
