import { WebJumpRetrievedDtoOutput as BTWebJump } from '../../../../beyondtrust-pra-conf-api/jump-item/web-jump/dtos/outputs';
import { JumpGroupEntity } from '../../../../jump-group/repositories/entities';
import { JumpPolicyEntity } from '../../../../jump-policy/repositories/entities';
import { JumpointEntity } from '../../../../jumpoint/repositories/entities';
import { DateUtility } from '../../../../shared/utilities';
import { JumpGroupType, WebJumpUsernameFormatType } from '../../enums';
import { mapFromBTJumpGroupType, mapFromBTWebJumpUsernameFormatType } from '../../mappers';
import { WebJump } from '../../models';

export class WebJumpEntity implements WebJump {
    public id!: number;
    public name!: string;
    public jumpointId!: number;
    public url!: string;
    public jumpGroupId!: number;
    public jumpGroupType?: JumpGroupType;
    public usernameFormatType?: WebJumpUsernameFormatType;
    public mustVerifyCertificate?: boolean;
    public authenticationTimeoutInSeconds?: number;
    public tag?: string;
    public comments?: string;
    public jumpPolicyId?: number | null;
    public usernameField?: string | null;
    public passwordField?: string | null;
    public submitField?: string | null;
    public sessionPolicyId?: number | null;
    public lastSyncDate!: Date;
    public jumpoint?: JumpointEntity;
    public jumpGroup?: JumpGroupEntity;
    public jumpPolicy?: JumpPolicyEntity;

    public static create(
        id: number,
        name: string,
        jumpointId: number,
        url: string,
        jumpGroupId: number,
        jumpGroupType?: JumpGroupType,
        usernameFormatType?: WebJumpUsernameFormatType,
        mustVerifyCertificate?: boolean,
        authenticationTimeoutInSeconds?: number,
        tag?: string,
        comments?: string,
        jumpPolicyId?: number | null,
        usernameField?: string | null,
        passwordField?: string | null,
        submitField?: string | null,
        sessionPolicyId?: number | null,
    ): WebJumpEntity {
        const entity = new WebJumpEntity();
        entity.id = id;
        entity.name = name;
        entity.jumpointId = jumpointId;
        entity.url = url;
        entity.jumpGroupId = jumpGroupId;
        entity.jumpGroupType = jumpGroupType;
        entity.usernameFormatType = usernameFormatType;
        entity.mustVerifyCertificate = mustVerifyCertificate;
        entity.authenticationTimeoutInSeconds = authenticationTimeoutInSeconds;
        entity.tag = tag;
        entity.comments = comments;
        entity.jumpPolicyId = jumpPolicyId;
        entity.usernameField = usernameField;
        entity.passwordField = passwordField;
        entity.submitField = submitField;
        entity.sessionPolicyId = sessionPolicyId;
        entity.lastSyncDate = DateUtility.getCurrentUtcDate();

        return entity;
    }

    public static createFromBT(btWebJump: BTWebJump) {
        return WebJumpEntity.create(
            btWebJump.id,
            btWebJump.name,
            btWebJump.jumpointId,
            btWebJump.url,
            btWebJump.jumpGroupId,
            btWebJump.jumpGroupType ? mapFromBTJumpGroupType(btWebJump.jumpGroupType) : undefined,
            btWebJump.usernameFormat ? mapFromBTWebJumpUsernameFormatType(btWebJump.usernameFormat) : undefined,
            btWebJump.verifyCertificate,
            btWebJump.authenticationTimeout,
            btWebJump.tag,
            btWebJump.comments,
            btWebJump.jumpPolicyId,
            btWebJump.usernameField,
            btWebJump.passwordField,
            btWebJump.submitField,
            btWebJump.sessionPolicyId,
        );
    }
}
