import { WebJumpUsernameFormatType as BTWebJumpUsernameFormatType } from '../../../beyondtrust-pra-conf-api/jump-item/web-jump/enums';
import { WebJumpUsernameFormatType } from '../enums';

export function mapFromBTWebJumpUsernameFormatType(
    btWebJumpUsernameFormatType: BTWebJumpUsernameFormatType,
): WebJumpUsernameFormatType {
    switch (btWebJumpUsernameFormatType) {
        case BTWebJumpUsernameFormatType.Default:
            return WebJumpUsernameFormatType.Default;
        case BTWebJumpUsernameFormatType.ForceDllnFormat:
            return WebJumpUsernameFormatType.ForceDllnFormat;
        case BTWebJumpUsernameFormatType.ForceUpnFormat:
            return WebJumpUsernameFormatType.ForceUpnFormat;
        case BTWebJumpUsernameFormatType.UsernameOnly:
            return WebJumpUsernameFormatType.UsernameOnly;
        default:
            throw new Error(`Unknown BTWebJumpUsernameFormatType: ${btWebJumpUsernameFormatType}`);
    }
}

export function mapToBTWebJumpUsernameFormatType(
    webJumpUsernameFormatType: WebJumpUsernameFormatType,
): BTWebJumpUsernameFormatType {
    switch (webJumpUsernameFormatType) {
        case WebJumpUsernameFormatType.Default:
            return BTWebJumpUsernameFormatType.Default;
        case WebJumpUsernameFormatType.ForceDllnFormat:
            return BTWebJumpUsernameFormatType.ForceDllnFormat;
        case WebJumpUsernameFormatType.ForceUpnFormat:
            return BTWebJumpUsernameFormatType.ForceUpnFormat;
        case WebJumpUsernameFormatType.UsernameOnly:
            return BTWebJumpUsernameFormatType.UsernameOnly;
        default:
            throw new Error(`Unknown WebJumpUsernameFormatType: ${webJumpUsernameFormatType}`);
    }
}
