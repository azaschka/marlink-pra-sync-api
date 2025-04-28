import {
    JumpClientConnectionType,
    JumpClientEndpointAgreementPolicyType,
    JumpClientGroupType,
    JumpClientInstallMode,
    JumpClientUnavailableReasonType,
} from '../enums';

export interface JumpClientRetrieved {
    jumpGroupId: number;
    id?: number;
    jumpGroupType?: JumpClientGroupType;
    name?: string;
    hostname?: string;
    fqdn?: string;
    tag?: string;
    comments?: string;
    jumpPolicyId?: number | null;
    sessionPolicyId?: number | null;
    installMode?: JumpClientInstallMode;
    connectionType?: JumpClientConnectionType;
    lastConnectDate?: Date;
    lastDisconnectDate?: Date;
    isLost?: boolean;
    needsUpdate?: boolean;
    unavailableReasonType?: JumpClientUnavailableReasonType;
    operatingSystem?: string;
    publicIp?: string;
    privateIp?: string;
    consoleUser?: string;
    expirationDate?: Date;
    maxOfflineTimeInMinutes?: number;
    lastAccessDate?: Date;
    endpointAgreementPolicyType?: JumpClientEndpointAgreementPolicyType;
    jumpointProxy?: string | null;
}
