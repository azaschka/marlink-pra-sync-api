import { JumpGroupType as BTJumpGroupType } from '../../../beyondtrust-pra-conf-api/jump-item/remote-rdp/enums';
import { JumpGroupType } from '../enums';

export function mapFromBTJumpGroupType(btJumpGroupType: BTJumpGroupType): JumpGroupType {
    switch (btJumpGroupType) {
        case BTJumpGroupType.Personal:
            return JumpGroupType.Personal;
        case BTJumpGroupType.Shared:
            return JumpGroupType.Shared;
        default:
            throw new Error(`Unknown BTJumpGroupType: ${btJumpGroupType}`);
    }
}

export function mapToBTJumpGroupType(jumpGroupType: JumpGroupType): BTJumpGroupType {
    switch (jumpGroupType) {
        case JumpGroupType.Personal:
            return BTJumpGroupType.Personal;
        case JumpGroupType.Shared:
            return BTJumpGroupType.Shared;
        default:
            throw new Error(`Unknown JumpGroupType: ${jumpGroupType}`);
    }
}
