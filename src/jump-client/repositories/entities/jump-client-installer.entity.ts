import { JumpClientInstallerRetrievedDtoOutput as BTJumpClientInstaller } from '../../../beyondtrust-pra-conf-api/jump-client/dtos/outputs';
import { DateUtility } from '../../../shared/utilities';
import { JumpClientConnectionType, JumpClientGroupType } from '../../enums';
import {
    mapFromBTJumpClientConnectionType,
    mapFromBTJumpClientGroupType,
    mapFromBTJumpClientInstallerKeyInfo,
} from '../../mappers';
import { JumpClientInstaller, JumpClientInstallerKeyInfo } from '../../models';

export class JumpClientInstallerEntity implements JumpClientInstaller {
    public id!: number;
    public jumpGroupId!: number;
    public jumpGroupType?: JumpClientGroupType;
    public name?: string;
    public tag?: string;
    public comments?: string;
    public jumpPolicyId?: number;
    public sessionPolicyId?: number | null;
    public connectionType?: JumpClientConnectionType;
    public expirationDate?: Date;
    public maxOfflineDurationInMinutes?: number;
    public shouldElevateInstall?: boolean;
    public shouldElevatePrompt?: boolean;
    public canOverrideJumpGroup?: boolean;
    public canOverrideJumpPolicy?: boolean;
    public canOverrideName?: boolean;
    public canOverrideTag?: boolean;
    public canOverrideComments?: boolean;
    public canOverrideSessionPolicy?: boolean;
    public installerId?: string;
    public keyInfo?: JumpClientInstallerKeyInfo[];
    public jumpointProxy?: string | null;
    public lastSyncDate!: Date;

    public static create(
        id: number,
        jumpGroupId: number,
        jumpGroupType?: JumpClientGroupType,
        name?: string,
        tag?: string,
        comments?: string,
        jumpPolicyId?: number,
        sessionPolicyId?: number | null,
        connectionType?: JumpClientConnectionType,
        expirationDate?: Date,
        maxOfflineDurationInMinutes?: number,
        shouldElevateInstall?: boolean,
        shouldElevatePrompt?: boolean,
        canOverrideJumpGroup?: boolean,
        canOverrideJumpPolicy?: boolean,
        canOverrideName?: boolean,
        canOverrideTag?: boolean,
        canOverrideComments?: boolean,
        canOverrideSessionPolicy?: boolean,
        installerId?: string,
        keyInfo?: JumpClientInstallerKeyInfo[],
        jumpointProxy?: string | null,
    ) {
        const entity = new JumpClientInstallerEntity();
        entity.id = id;
        entity.jumpGroupId = jumpGroupId;
        entity.jumpGroupType = jumpGroupType;
        entity.name = name;
        entity.tag = tag;
        entity.comments = comments;
        entity.jumpPolicyId = jumpPolicyId;
        entity.sessionPolicyId = sessionPolicyId;
        entity.connectionType = connectionType;
        entity.expirationDate = expirationDate;
        entity.maxOfflineDurationInMinutes = maxOfflineDurationInMinutes;
        entity.shouldElevateInstall = shouldElevateInstall;
        entity.shouldElevatePrompt = shouldElevatePrompt;
        entity.canOverrideJumpGroup = canOverrideJumpGroup;
        entity.canOverrideJumpPolicy = canOverrideJumpPolicy;
        entity.canOverrideName = canOverrideName;
        entity.canOverrideTag = canOverrideTag;
        entity.canOverrideComments = canOverrideComments;
        entity.canOverrideSessionPolicy = canOverrideSessionPolicy;
        entity.installerId = installerId;
        entity.keyInfo = keyInfo;
        entity.jumpointProxy = jumpointProxy;
        entity.lastSyncDate = DateUtility.getCurrentUtcDate();

        return entity;
    }

    public static createFromBT(btJumpClientInstaller: BTJumpClientInstaller) {
        return JumpClientInstallerEntity.create(
            btJumpClientInstaller.id,
            btJumpClientInstaller.jumpGroupId,
            btJumpClientInstaller.jumpGroupType
                ? mapFromBTJumpClientGroupType(btJumpClientInstaller.jumpGroupType)
                : undefined,
            btJumpClientInstaller.name,
            btJumpClientInstaller.tag,
            btJumpClientInstaller.comments,
            btJumpClientInstaller.jumpPolicyId,
            btJumpClientInstaller.sessionPolicyId,
            btJumpClientInstaller.connectionType
                ? mapFromBTJumpClientConnectionType(btJumpClientInstaller.connectionType)
                : undefined,
            btJumpClientInstaller.expirationTimestamp
                ? new Date(btJumpClientInstaller.expirationTimestamp)
                : btJumpClientInstaller.expirationTimestamp,
            btJumpClientInstaller.maxOfflineMinutes,
            btJumpClientInstaller.elevateInstall,
            btJumpClientInstaller.elevatePrompt,
            btJumpClientInstaller.allowOverrideJumpGroup,
            btJumpClientInstaller.allowOverrideJumpPolicy,
            btJumpClientInstaller.allowOverrideName,
            btJumpClientInstaller.allowOverrideTag,
            btJumpClientInstaller.allowOverrideComments,
            btJumpClientInstaller.allowOverrideSessionPolicy,
            btJumpClientInstaller.installerId,
            btJumpClientInstaller.keyInfo
                ? mapFromBTJumpClientInstallerKeyInfo(btJumpClientInstaller.keyInfo)
                : undefined,
            btJumpClientInstaller.jumpointProxy,
        );
    }
}
