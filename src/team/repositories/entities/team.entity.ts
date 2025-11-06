import { TeamRetrievedDtoOutput as BTTeam } from '../../../beyondtrust-pra-conf-api/team/dtos/outputs';
import { GroupPolicyTeamEntity } from '../../../group-policy-team/repositories/entities';
import { DateUtility } from '../../../shared/utilities';
import { TeamUserEntity } from '../../../team-user/repositories/entities';
import { Team } from '../../models';

export class TeamEntity implements Team {
    public id!: number;
    public name!: string;
    public codeName?: string;
    public comments?: string | null;
    public lastSyncDate!: Date;
    public teamUsers?: TeamUserEntity[];
    public groupPolicyTeams?: GroupPolicyTeamEntity[];

    public static create(id: number, name: string, codeName?: string, comments?: string | null): TeamEntity {
        const entity = new TeamEntity();
        entity.id = id;
        entity.name = name;
        entity.codeName = codeName;
        entity.comments = comments;
        entity.lastSyncDate = DateUtility.getCurrentUtcDate();

        return entity;
    }

    public static createFromBT(btTeam: BTTeam) {
        return TeamEntity.create(btTeam.id, btTeam.name, btTeam.codeName, btTeam.comments);
    }
}
