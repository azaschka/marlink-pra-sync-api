import { SecureAppType as BTSecureAppType } from '../../../beyondtrust-pra-conf-api/jump-item/remote-rdp/enums';
import { SecureAppType } from '../enums';

export function mapFromBTSecureAppType(btSecureAppType: BTSecureAppType): SecureAppType {
    switch (btSecureAppType) {
        case BTSecureAppType.None:
            return SecureAppType.None;
        case BTSecureAppType.RemoteApp:
            return SecureAppType.RemoteApp;
        case BTSecureAppType.RemoteDesktopAgent:
            return SecureAppType.RemoteDesktopAgent;
        case BTSecureAppType.RemoteDesktopAgentCredentials:
            return SecureAppType.RemoteDesktopAgentCredentials;
        default:
            throw new Error(`Unknown BTSecureAppType: ${btSecureAppType}`);
    }
}

export function mapToBTSecureAppType(secureAppType: SecureAppType): BTSecureAppType {
    switch (secureAppType) {
        case SecureAppType.None:
            return BTSecureAppType.None;
        case SecureAppType.RemoteApp:
            return BTSecureAppType.RemoteApp;
        case SecureAppType.RemoteDesktopAgent:
            return BTSecureAppType.RemoteDesktopAgent;
        case SecureAppType.RemoteDesktopAgentCredentials:
            return BTSecureAppType.RemoteDesktopAgentCredentials;
        default:
            throw new Error(`Unknown SecureAppType: ${secureAppType}`);
    }
}
