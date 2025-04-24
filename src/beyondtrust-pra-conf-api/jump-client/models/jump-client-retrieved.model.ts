import {
    JumpClientConnectionType,
    JumpClientEndpointAgreementPolicyType,
    JumpClientGroupType,
    JumpClientInstallMode,
    JumpClientUnavailableReasonType,
} from '../enums';

// TODO confirm required fields
export interface JumpClientRetrieved {
    jumpGroupId: number;
    id: number;
    jumpGroupType: JumpClientGroupType;
    name: string;
    hostname: string;
    fqdn: string;
    tag: string;
    comments: string;
    jumpPolicyId: number;
    sessionPolicyId: number;
    installMode: JumpClientInstallMode;
    connectionType: JumpClientConnectionType;
    lastConnectTimestamp: Date;
    lastDisconnectTimestamp: Date;
    isLost: boolean;
    needsUpdate: boolean;
    unavailableReason: JumpClientUnavailableReasonType;
    operatingSystem: string;
    publicIp: string;
    privateIp: string;
    consoleUser: string;
    expirationTimestamp: Date;
    maxOfflineMinutes: number;
    lastAccessTimestamp: Date;
    endpointAgreementPolicy: JumpClientEndpointAgreementPolicyType;
    jumpointProxy?: string | null;
}
