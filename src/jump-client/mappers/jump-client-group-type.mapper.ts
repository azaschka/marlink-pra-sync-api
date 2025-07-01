import { JumpClientGroupType as BTJumpClientGroupType } from '../../beyondtrust-pra-conf-api/jump-client/enums';
import { JumpClientGroupType } from '../enums';

export function mapFromBTJumpClientGroupType(btJumpClientGroupType: BTJumpClientGroupType): JumpClientGroupType {
    switch (btJumpClientGroupType) {
        case BTJumpClientGroupType.Personal:
            return JumpClientGroupType.Personal;
        case BTJumpClientGroupType.Shared:
            return JumpClientGroupType.Shared;
        default:
            throw new Error(`Unknown BTJumpClientGroupType: ${btJumpClientGroupType}`);
    }
}

export function mapToBTJumpClientGroupType(jumpClientGroupType: JumpClientGroupType): BTJumpClientGroupType {
    switch (jumpClientGroupType) {
        case JumpClientGroupType.Personal:
            return BTJumpClientGroupType.Personal;
        case JumpClientGroupType.Shared:
            return BTJumpClientGroupType.Shared;
        default:
            throw new Error(`Unknown JumpClientGroupType: ${jumpClientGroupType}`);
    }
}
