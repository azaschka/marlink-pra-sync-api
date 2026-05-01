import { SessionPolicyRetrievedDtoOutput as BTSessionPolicy } from '../../../beyondtrust-pra-conf-api/session-policy/dtos/outputs';
import { DateUtility } from '../../../shared/utilities';
import { SessionPolicy } from '../../models';

export class SessionPolicyEntity implements SessionPolicy {
    public id!: number;
    public displayName!: string;
    public codeName!: string;
    public description!: string | null;
    public lastSyncDate!: Date;

    public static create(
        id: number,
        displayName: string,
        codeName: string,
        description: string | null,
    ): SessionPolicyEntity {
        const entity = new SessionPolicyEntity();
        entity.id = id;
        entity.displayName = displayName;
        entity.codeName = codeName;
        entity.description = description;
        entity.lastSyncDate = DateUtility.getCurrentUtcDate();

        return entity;
    }

    public static createFromBT(btSessionPolicy: BTSessionPolicy) {
        return SessionPolicyEntity.create(
            btSessionPolicy.id,
            btSessionPolicy.displayName,
            btSessionPolicy.codeName,
            btSessionPolicy.description,
        );
    }
}
