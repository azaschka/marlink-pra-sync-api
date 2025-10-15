import { GroupPolicyRetrievedDtoOutput as BTGroupPolicy } from '../../beyondtrust-pra-conf-api/group-policy/dtos/outputs';
import {
    JumpClientRetrievedDtoOutput as BTJumpClient,
    JumpClientInstallerRetrievedDtoOutput as BTJumpClientInstaller,
} from '../../beyondtrust-pra-conf-api/jump-client/dtos/outputs';
import { JumpGroupRetrievedDtoOutput as BTJumpGroup } from '../../beyondtrust-pra-conf-api/jump-group/dtos/outputs';
import { ProtocolTunnelJumpRetrievedDtoOutput as BTProtocolTunnelJump } from '../../beyondtrust-pra-conf-api/jump-item/protocol-tunnel-jump/dtos/outputs';
import { RemoteRdpRetrievedDtoOutput as BTRemoteRdp } from '../../beyondtrust-pra-conf-api/jump-item/remote-rdp/dtos/outputs';
import { RemoteVncRetrievedDtoOutput as BTRemoteVnc } from '../../beyondtrust-pra-conf-api/jump-item/remote-vnc/dtos/outputs';
import { ShellJumpRetrievedDtoOutput as BTShellJump } from '../../beyondtrust-pra-conf-api/jump-item/shell-jump/dtos/outputs';
import { WebJumpRetrievedDtoOutput as BTWebJump } from '../../beyondtrust-pra-conf-api/jump-item/web-jump/dtos/outputs';
import { JumpPolicyRetrievedDtoOutput as BTJumpPolicy } from '../../beyondtrust-pra-conf-api/jump-policy/dtos/outputs';
import { JumpointRetrievedDtoOutput as BTJumpoint } from '../../beyondtrust-pra-conf-api/jumpoint/dtos/outputs';
import { TeamRetrievedDtoOutput as BTTeam } from '../../beyondtrust-pra-conf-api/team/dtos/outputs';
import { UserRetrievedDtoOutput as BTUser } from '../../beyondtrust-pra-conf-api/user/dtos/outputs';
import { GroupPolicy as DBGroupPolicy } from '../../group-policy/models';
import { GroupPolicyEntity } from '../../group-policy/repositories/entities';
import { JumpClient as DBJumpClient, JumpClientInstaller as DBJumpClientInstaller } from '../../jump-client/models';
import { JumpClientEntity, JumpClientInstallerEntity } from '../../jump-client/repositories/entities';
import { JumpGroup as DBJumpGroup } from '../../jump-group/models';
import { JumpGroupEntity } from '../../jump-group/repositories/entities';
import { ProtocolTunnelJump as DBProtocolTunnelJump } from '../../jump-item/protocol-tunnel-jump/models';
import { ProtocolTunnelJumpEntity } from '../../jump-item/protocol-tunnel-jump/repositories/entities';
import { RemoteRdp as DBRemoteRdp } from '../../jump-item/remote-rdp/models';
import { RemoteRdpEntity } from '../../jump-item/remote-rdp/repositories/entities';
import { RemoteVnc as DBRemoteVnc } from '../../jump-item/remote-vnc/models';
import { RemoteVncEntity } from '../../jump-item/remote-vnc/repositories/entities';
import { ShellJump as DBShellJump } from '../../jump-item/shell-jump/models';
import { ShellJumpEntity } from '../../jump-item/shell-jump/repositories/entities';
import { WebJump as DBWebJump } from '../../jump-item/web-jump/models';
import { WebJumpEntity } from '../../jump-item/web-jump/repositories/entities';
import { JumpPolicy as DBJumpPolicy } from '../../jump-policy/models';
import { JumpPolicyEntity } from '../../jump-policy/repositories/entities';
import { Jumpoint as DBJumpoint } from '../../jumpoint/models';
import { JumpointEntity } from '../../jumpoint/repositories/entities';
import { Team as DBTeam } from '../../team/models';
import { TeamEntity } from '../../team/repositories/entities';
import { User as DBUser } from '../../user/models';
import { UserEntity } from '../../user/repositories/entities';
import { SyncEntityType } from '../enums';
import { SyncStrategy } from '../types';

export interface SyncStrategyMap {
    [SyncEntityType.GroupPolicy]: SyncStrategy<BTGroupPolicy, DBGroupPolicy, GroupPolicyEntity>;
    [SyncEntityType.JumpClientInstaller]: SyncStrategy<
        BTJumpClientInstaller,
        DBJumpClientInstaller,
        JumpClientInstallerEntity
    >;
    [SyncEntityType.JumpClient]: SyncStrategy<BTJumpClient, DBJumpClient, JumpClientEntity>;
    [SyncEntityType.JumpGroup]: SyncStrategy<BTJumpGroup, DBJumpGroup, JumpGroupEntity>;
    [SyncEntityType.JumpPolicy]: SyncStrategy<BTJumpPolicy, DBJumpPolicy, JumpPolicyEntity>;
    [SyncEntityType.Jumpoint]: SyncStrategy<BTJumpoint, DBJumpoint, JumpointEntity>;
    [SyncEntityType.JumpItemProtocolTunnelJump]: SyncStrategy<
        BTProtocolTunnelJump,
        DBProtocolTunnelJump,
        ProtocolTunnelJumpEntity
    >;
    [SyncEntityType.JumpItemRemoteRdp]: SyncStrategy<BTRemoteRdp, DBRemoteRdp, RemoteRdpEntity>;
    [SyncEntityType.JumpItemRemoteVnc]: SyncStrategy<BTRemoteVnc, DBRemoteVnc, RemoteVncEntity>;
    [SyncEntityType.JumpItemShellJump]: SyncStrategy<BTShellJump, DBShellJump, ShellJumpEntity>;
    [SyncEntityType.JumpItemWebJump]: SyncStrategy<BTWebJump, DBWebJump, WebJumpEntity>;
    [SyncEntityType.Team]: SyncStrategy<BTTeam, DBTeam, TeamEntity>;
    [SyncEntityType.User]: SyncStrategy<BTUser, DBUser, UserEntity>;
}
