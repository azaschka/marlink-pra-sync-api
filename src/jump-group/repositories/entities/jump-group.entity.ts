import { GroupPolicyJumpGroupEntity } from '../../../group-policy-jump-group/repositories/entities';
import { JumpClientEntity } from '../../../jump-client/repositories/entities';
import { ProtocolTunnelJumpEntity } from '../../../jump-item/protocol-tunnel-jump/repositories/entities';
import { RemoteRdpEntity } from '../../../jump-item/remote-rdp/repositories/entities';
import { RemoteVncEntity } from '../../../jump-item/remote-vnc/repositories/entities';
import { ShellJumpEntity } from '../../../jump-item/shell-jump/repositories/entities';
import { WebJumpEntity } from '../../../jump-item/web-jump/repositories/entities';
import { DateUtility } from '../../../shared/utilities';
import { JumpGroup } from '../../models';

export class JumpGroupEntity implements JumpGroup {
    public id!: number;
    public name!: string;
    public codeName?: string;
    public comments?: string | null;
    public lastSyncDate!: Date;
    public groupPolicyJumpGroups?: GroupPolicyJumpGroupEntity[];
    public protocolTunnelJumps?: ProtocolTunnelJumpEntity[];
    public remoteRdps?: RemoteRdpEntity[];
    public remoteVncs?: RemoteVncEntity[];
    public shellJumps?: ShellJumpEntity[];
    public webJumps?: WebJumpEntity[];
    public jumpClients?: JumpClientEntity[];

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
