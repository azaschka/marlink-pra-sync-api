import { RemoteRdpRetrievedDtoOutput as BTRemoteRdp } from '../../../../beyondtrust-pra-conf-api/jump-item/remote-rdp/dtos/outputs';
import { JumpGroupEntity } from '../../../../jump-group/repositories/entities';
import { JumpPolicyEntity } from '../../../../jump-policy/repositories/entities';
import { JumpointEntity } from '../../../../jumpoint/repositories/entities';
import { DateUtility } from '../../../../shared/utilities';
import { JumpGroupType, RdpQualityMode, SecureAppType } from '../../enums';
import { mapFromBTJumpGroupType, mapFromBTRdpQualityMode, mapFromBTSecureAppType } from '../../mappers';
import { RemoteRdp } from '../../models';

export class RemoteRdpEntity implements RemoteRdp {
    public id!: number;
    public name!: string;
    public jumpointId!: number;
    public hostname!: string;
    public jumpGroupId!: number;
    public jumpGroupType?: JumpGroupType;
    public qualityMode?: RdpQualityMode;
    public mustStartNewConsoleSession?: boolean;
    public mustIgnoreUntrustedServerCert?: boolean;
    public tag?: string;
    public comments?: string;
    public rdpUsername?: string;
    public domain?: string;
    public jumpPolicyId?: number | null;
    public isSessionForensicsEnabled?: boolean;
    public sessionPolicyId?: number | null;
    public endpointId?: number | null;
    public secureAppType?: SecureAppType;
    public remoteAppName?: string;
    public remoteAppParams?: string;
    public remoteExePath?: string;
    public remoteExeParams?: string;
    public targetSystem?: string;
    public credentialType?: string;
    public lastSyncDate!: Date;
    public jumpoint?: JumpointEntity;
    public jumpGroup?: JumpGroupEntity;
    public jumpPolicy?: JumpPolicyEntity;

    public static create(
        id: number,
        name: string,
        jumpointId: number,
        hostname: string,
        jumpGroupId: number,
        jumpGroupType?: JumpGroupType,
        qualityMode?: RdpQualityMode,
        mustStartNewConsoleSession?: boolean,
        mustIgnoreUntrustedServerCert?: boolean,
        tag?: string,
        comments?: string,
        rdpUsername?: string,
        domain?: string,
        jumpPolicyId?: number | null,
        isSessionForensicsEnabled?: boolean,
        sessionPolicyId?: number | null,
        endpointId?: number | null,
        secureAppType?: SecureAppType,
        remoteAppName?: string,
        remoteAppParams?: string,
        remoteExePath?: string,
        remoteExeParams?: string,
        targetSystem?: string,
        credentialType?: string,
    ): RemoteRdpEntity {
        const entity = new RemoteRdpEntity();
        entity.id = id;
        entity.name = name;
        entity.jumpointId = jumpointId;
        entity.hostname = hostname;
        entity.jumpGroupId = jumpGroupId;
        entity.jumpGroupType = jumpGroupType;
        entity.qualityMode = qualityMode;
        entity.mustStartNewConsoleSession = mustStartNewConsoleSession;
        entity.mustIgnoreUntrustedServerCert = mustIgnoreUntrustedServerCert;
        entity.tag = tag;
        entity.comments = comments;
        entity.rdpUsername = rdpUsername;
        entity.domain = domain;
        entity.jumpPolicyId = jumpPolicyId;
        entity.isSessionForensicsEnabled = isSessionForensicsEnabled;
        entity.sessionPolicyId = sessionPolicyId;
        entity.endpointId = endpointId;
        entity.secureAppType = secureAppType;
        entity.remoteAppName = remoteAppName;
        entity.remoteAppParams = remoteAppParams;
        entity.remoteExePath = remoteExePath;
        entity.remoteExeParams = remoteExeParams;
        entity.targetSystem = targetSystem;
        entity.credentialType = credentialType;
        entity.lastSyncDate = DateUtility.getCurrentUtcDate();

        return entity;
    }

    public static createFromBT(btRemoteRdp: BTRemoteRdp) {
        return RemoteRdpEntity.create(
            btRemoteRdp.id,
            btRemoteRdp.name,
            btRemoteRdp.jumpointId,
            btRemoteRdp.hostname,
            btRemoteRdp.jumpGroupId,
            btRemoteRdp.jumpGroupType ? mapFromBTJumpGroupType(btRemoteRdp.jumpGroupType) : undefined,
            btRemoteRdp.quality ? mapFromBTRdpQualityMode(btRemoteRdp.quality) : undefined,
            btRemoteRdp.console,
            btRemoteRdp.ignoreUntrusted,
            btRemoteRdp.tag,
            btRemoteRdp.comments,
            btRemoteRdp.rdpUsername,
            btRemoteRdp.domain,
            btRemoteRdp.jumpPolicyId,
            btRemoteRdp.sessionForensics,
            btRemoteRdp.sessionPolicyId,
            btRemoteRdp.endpointId,
            btRemoteRdp.secureAppType ? mapFromBTSecureAppType(btRemoteRdp.secureAppType) : undefined,
            btRemoteRdp.remoteAppName,
            btRemoteRdp.remoteAppParams,
            btRemoteRdp.remoteExePath,
            btRemoteRdp.remoteExeParams,
            btRemoteRdp.targetSystem,
            btRemoteRdp.credentialType,
        );
    }
}
