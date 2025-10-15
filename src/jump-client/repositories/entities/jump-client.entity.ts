import { JumpClientRetrievedDtoOutput as BTJumpClient } from '../../../beyondtrust-pra-conf-api/jump-client/dtos/outputs';
import { JumpGroupEntity } from '../../../jump-group/repositories/entities';
import { JumpPolicyEntity } from '../../../jump-policy/repositories/entities';
import { DateUtility } from '../../../shared/utilities';
import {
    JumpClientConnectionType,
    JumpClientEndpointAgreementPolicyType,
    JumpClientGroupType,
    JumpClientInstallMode,
    JumpClientUnavailableReasonType,
} from '../../enums';
import {
    mapFromBTJumpClientConnectionType,
    mapFromBTJumpClientEndpointAgreementPolicyType,
    mapFromBTJumpClientGroupType,
    mapFromBTJumpClientInstallMode,
    mapFromBTJumpClientUnavailableReasonType,
} from '../../mappers';
import { JumpClient } from '../../models';

export class JumpClientEntity implements JumpClient {
    public id!: number;
    public jumpGroupId!: number;
    public jumpGroupType?: JumpClientGroupType;
    public name?: string;
    public hostname?: string;
    public fqdn?: string;
    public tag?: string;
    public comments?: string;
    public jumpPolicyId?: number | null;
    public sessionPolicyId?: number | null;
    public installMode?: JumpClientInstallMode;
    public connectionType?: JumpClientConnectionType;
    public lastConnectDate?: Date;
    public lastDisconnectDate?: Date;
    public isLost?: boolean;
    public needsUpdate?: boolean;
    public unavailableReasonType?: JumpClientUnavailableReasonType;
    public operatingSystem?: string;
    public publicIp?: string;
    public privateIp?: string;
    public consoleUser?: string;
    public expirationDate?: Date;
    public maxOfflineDurationInMinutes?: number;
    public lastAccessDate?: Date;
    public endpointAgreementPolicyType?: JumpClientEndpointAgreementPolicyType;
    public jumpointProxy?: string | null;
    public lastSyncDate!: Date;
    public jumpGroup?: JumpGroupEntity;
    public jumpPolicy?: JumpPolicyEntity;

    public static create(
        id: number,
        jumpGroupId: number,
        jumpGroupType?: JumpClientGroupType,
        name?: string,
        hostname?: string,
        fqdn?: string,
        tag?: string,
        comments?: string,
        jumpPolicyId?: number | null,
        sessionPolicyId?: number | null,
        installMode?: JumpClientInstallMode,
        connectionType?: JumpClientConnectionType,
        lastConnectDate?: Date,
        lastDisconnectDate?: Date,
        isLost?: boolean,
        needsUpdate?: boolean,
        unavailableReasonType?: JumpClientUnavailableReasonType,
        operatingSystem?: string,
        publicIp?: string,
        privateIp?: string,
        consoleUser?: string,
        expirationDate?: Date,
        maxOfflineDurationInMinutes?: number,
        lastAccessDate?: Date,
        endpointAgreementPolicyType?: JumpClientEndpointAgreementPolicyType,
        jumpointProxy?: string | null,
    ) {
        const entity = new JumpClientEntity();
        entity.id = id;
        entity.jumpGroupId = jumpGroupId;
        entity.jumpGroupType = jumpGroupType;
        entity.name = name;
        entity.hostname = hostname;
        entity.fqdn = fqdn;
        entity.tag = tag;
        entity.comments = comments;
        entity.jumpPolicyId = jumpPolicyId;
        entity.sessionPolicyId = sessionPolicyId;
        entity.installMode = installMode;
        entity.connectionType = connectionType;
        entity.lastConnectDate = lastConnectDate;
        entity.lastDisconnectDate = lastDisconnectDate;
        entity.isLost = isLost;
        entity.needsUpdate = needsUpdate;
        entity.unavailableReasonType = unavailableReasonType;
        entity.operatingSystem = operatingSystem;
        entity.publicIp = publicIp;
        entity.privateIp = privateIp;
        entity.consoleUser = consoleUser;
        entity.expirationDate = expirationDate;
        entity.maxOfflineDurationInMinutes = maxOfflineDurationInMinutes;
        entity.lastAccessDate = lastAccessDate;
        entity.endpointAgreementPolicyType = endpointAgreementPolicyType;
        entity.jumpointProxy = jumpointProxy;
        entity.lastSyncDate = DateUtility.getCurrentUtcDate();

        return entity;
    }

    public static createFromBT(btJumpClient: BTJumpClient) {
        return JumpClientEntity.create(
            btJumpClient.id,
            btJumpClient.jumpGroupId,
            btJumpClient.jumpGroupType ? mapFromBTJumpClientGroupType(btJumpClient.jumpGroupType) : undefined,
            btJumpClient.name,
            btJumpClient.hostname,
            btJumpClient.fqdn,
            btJumpClient.tag,
            btJumpClient.comments,
            btJumpClient.jumpPolicyId,
            btJumpClient.sessionPolicyId,
            btJumpClient.installMode ? mapFromBTJumpClientInstallMode(btJumpClient.installMode) : undefined,
            btJumpClient.connectionType ? mapFromBTJumpClientConnectionType(btJumpClient.connectionType) : undefined,
            btJumpClient.lastConnectTimestamp
                ? new Date(btJumpClient.lastConnectTimestamp)
                : btJumpClient.lastConnectTimestamp,
            btJumpClient.lastDisconnectTimestamp
                ? new Date(btJumpClient.lastDisconnectTimestamp)
                : btJumpClient.lastDisconnectTimestamp,
            btJumpClient.isLost,
            btJumpClient.needsUpdate,
            btJumpClient.unavailableReason
                ? mapFromBTJumpClientUnavailableReasonType(btJumpClient.unavailableReason)
                : undefined,
            btJumpClient.operatingSystem,
            btJumpClient.publicIp,
            btJumpClient.privateIp,
            btJumpClient.consoleUser,
            btJumpClient.expirationTimestamp
                ? new Date(btJumpClient.expirationTimestamp)
                : btJumpClient.expirationTimestamp,
            btJumpClient.maxOfflineMinutes,
            btJumpClient.lastAccessTimestamp
                ? new Date(btJumpClient.lastAccessTimestamp)
                : btJumpClient.lastAccessTimestamp,
            btJumpClient.endpointAgreementPolicy
                ? mapFromBTJumpClientEndpointAgreementPolicyType(btJumpClient.endpointAgreementPolicy)
                : undefined,
            btJumpClient.jumpointProxy,
        );
    }
}
