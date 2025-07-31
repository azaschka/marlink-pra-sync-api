import { Column, Entity, OneToMany } from 'typeorm';
import { GroupPolicyJumpGroupEntity } from '../../../group-policy-jump-group/repositories/entities';
import { JumpClientEntity } from '../../../jump-client/repositories/entities';
import { ProtocolTunnelJumpEntity } from '../../../jump-item/protocol-tunnel-jump/repositories/entities';
import { RemoteRdpEntity } from '../../../jump-item/remote-rdp/repositories/entities';
import { RemoteVncEntity } from '../../../jump-item/remote-vnc/repositories/entities';
import { ShellJumpEntity } from '../../../jump-item/shell-jump/repositories/entities';
import { WebJumpEntity } from '../../../jump-item/web-jump/repositories/entities';
import { DateUtility } from '../../../shared/utilities';
import { JumpGroup } from '../../models';

@Entity({ name: 'jump_groups' })
export class JumpGroupEntity implements JumpGroup {
    @Column({ name: 'id', type: 'int', unique: true, primary: true, generated: false })
    public id!: number;

    @Column({ name: 'name', type: 'varchar' })
    public name!: string;

    @Column({ name: 'code_name', type: 'varchar', nullable: true })
    public codeName?: string;

    @Column({ name: 'comments', type: 'text', nullable: true })
    public comments?: string | null;

    @Column({ name: 'last_sync_date', type: 'timestamp', precision: 3 })
    public lastSyncDate!: Date;

    @OneToMany(() => GroupPolicyJumpGroupEntity, (groupPolicyJumpGroup) => groupPolicyJumpGroup.jumpGroup)
    public groupPolicyJumpGroups!: GroupPolicyJumpGroupEntity[];

    @OneToMany(() => ProtocolTunnelJumpEntity, (protocolTunnelJumpEntity) => protocolTunnelJumpEntity.jumpGroup)
    public protocolTunnelJumps!: ProtocolTunnelJumpEntity[];

    @OneToMany(() => RemoteRdpEntity, (remoteRdpEntity) => remoteRdpEntity.jumpGroup)
    public remoteRdps!: RemoteRdpEntity[];

    @OneToMany(() => RemoteVncEntity, (remoteVncEntity) => remoteVncEntity.jumpGroup)
    public remoteVncs!: RemoteVncEntity[];

    @OneToMany(() => ShellJumpEntity, (shellJumpEntity) => shellJumpEntity.jumpGroup)
    public shellJumps!: ShellJumpEntity[];

    @OneToMany(() => WebJumpEntity, (webJumpEntity) => webJumpEntity.jumpGroup)
    public webJumps!: WebJumpEntity[];

    @OneToMany(() => JumpClientEntity, (jumpClientEntity) => jumpClientEntity.jumpGroup)
    public jumpClients!: JumpClientEntity[];

    public static create(id: number, name: string, codeName?: string, comments?: string | null): JumpGroupEntity {
        const entity = new JumpGroupEntity();
        entity.id = id;
        entity.name = name;
        entity.codeName = codeName;
        entity.comments = comments;
        entity.lastSyncDate = DateUtility.getCurrentUtcDate();

        return entity;
    }
}
