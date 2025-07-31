import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { JumpGroupEntity } from '../../../../jump-group/repositories/entities';
import { JumpPolicyEntity } from '../../../../jump-policy/repositories/entities';
import { JumpointEntity } from '../../../../jumpoint/repositories/entities';
import { DateUtility } from '../../../../shared/utilities';
import { JumpGroupType, WebJumpUsernameFormatType } from '../../enums';
import { WebJump } from '../../models';

@Entity({ name: 'jump_item_web_jumps' })
export class WebJumpEntity implements WebJump {
    @Column({ name: 'id', type: 'int', unique: true, primary: true, generated: false })
    public id!: number;

    @Column({ name: 'name', type: 'varchar' })
    public name!: string;

    @Column({ name: 'jumpoint_id', type: 'int' })
    public jumpointId!: number;

    @Column({ name: 'url', type: 'varchar' })
    public url!: string;

    @Column({ name: 'jump_group_id', type: 'int' })
    public jumpGroupId!: number;

    @Column({ name: 'jump_group_type', type: 'enum', enum: JumpGroupType, nullable: true })
    public jumpGroupType?: JumpGroupType;

    @Column({ name: 'username_format_type', type: 'enum', enum: WebJumpUsernameFormatType, nullable: true })
    public usernameFormatType?: WebJumpUsernameFormatType;

    @Column({ name: 'must_verify_certificate', type: 'boolean', nullable: true })
    public mustVerifyCertificate?: boolean;

    @Column({ name: 'authentication_timeout_in_seconds', type: 'int', nullable: true })
    public authenticationTimeoutInSeconds?: number;

    @Column({ name: 'tag', type: 'varchar', nullable: true })
    public tag?: string;

    @Column({ name: 'comments', type: 'text', nullable: true })
    public comments?: string;

    @Column({ name: 'jump_policy_id', type: 'int', nullable: true })
    public jumpPolicyId?: number | null;

    @Column({ name: 'username_field', type: 'varchar', nullable: true })
    public usernameField?: string | null;

    @Column({ name: 'password_field', type: 'varchar', nullable: true })
    public passwordField?: string | null;

    @Column({ name: 'submit_field', type: 'varchar', nullable: true })
    public submitField?: string | null;

    @Column({ name: 'session_policy_id', type: 'int', nullable: true })
    public sessionPolicyId?: number | null;

    @Column({ name: 'last_sync_date', type: 'timestamp', precision: 3 })
    public lastSyncDate!: Date;

    @ManyToOne(() => JumpointEntity, (jumpoint) => jumpoint.webJumps, {
        onDelete: 'CASCADE',
        eager: true,
    })
    @JoinColumn({ name: 'jumpoint_id' })
    public jumpoint!: JumpointEntity;

    @ManyToOne(() => JumpGroupEntity, (jumpGroup) => jumpGroup.webJumps, {
        onDelete: 'CASCADE',
        eager: true,
    })
    @JoinColumn({ name: 'jump_group_id' })
    public jumpGroup!: JumpGroupEntity;

    @ManyToOne(() => JumpPolicyEntity, (jumpPolicy) => jumpPolicy.webJumps, {
        onDelete: 'SET NULL',
        eager: true,
    })
    @JoinColumn({ name: 'jump_policy_id' })
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
}
