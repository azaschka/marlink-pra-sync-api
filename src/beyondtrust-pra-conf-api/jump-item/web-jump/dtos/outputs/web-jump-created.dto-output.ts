import { Expose } from 'class-transformer';
import { JumpGroupType, WebJumpUsernameFormat } from '../../enums';

export class WebJumpCreatedDtoOutput {
    @Expose({ name: 'id' })
    public id!: number;

    @Expose({ name: 'name' })
    public name!: string;

    @Expose({ name: 'jumpoint_id' })
    public jumpointId!: number;

    @Expose({ name: 'url' })
    public url!: string;

    @Expose({ name: 'jump_group_id' })
    public jumpGroupId!: number;

    @Expose({ name: 'jump_group_type' })
    public jumpGroupType?: JumpGroupType;

    @Expose({ name: 'username_format' })
    public usernameFormat?: WebJumpUsernameFormat;

    @Expose({ name: 'verify_certificate' })
    public verifyCertificate?: boolean;

    @Expose({ name: 'authentication_timeout' })
    public authenticationTimeout?: number;

    @Expose({ name: 'tag' })
    public tag?: string;

    @Expose({ name: 'comments' })
    public comments?: string;

    @Expose({ name: 'jump_policy_id' })
    public jumpPolicyId?: number | null;

    @Expose({ name: 'username_field' })
    public usernameField?: string | null;

    @Expose({ name: 'password_field' })
    public passwordField?: string | null;

    @Expose({ name: 'submit_field' })
    public submitField?: string | null;

    @Expose({ name: 'session_policy_id' })
    public sessionPolicyId?: number | null;
}
