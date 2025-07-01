import { JumpClientUnavailableReasonType as BTJumpClientUnavailableReasonType } from '../../beyondtrust-pra-conf-api/jump-client/enums';
import { JumpClientUnavailableReasonType } from '../enums';

export function mapFromBTJumpClientUnavailableReasonType(
    btJumpClientUnavailableReasonType: BTJumpClientUnavailableReasonType,
): JumpClientUnavailableReasonType {
    switch (btJumpClientUnavailableReasonType) {
        case BTJumpClientUnavailableReasonType.Disabled:
            return JumpClientUnavailableReasonType.Disabled;
        case BTJumpClientUnavailableReasonType.None:
            return JumpClientUnavailableReasonType.None;
        default:
            throw new Error(`Unknown BTJumpClientUnavailableReasonType: ${btJumpClientUnavailableReasonType}`);
    }
}
