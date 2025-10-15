import { JumpointRetrievedDtoOutput as BTJumpoint } from '../../../beyondtrust-pra-conf-api/jumpoint/dtos/outputs';
import { GroupPolicyJumpointEntity } from '../../../group-policy-jumpoint/repositories/entities';
import { ProtocolTunnelJumpEntity } from '../../../jump-item/protocol-tunnel-jump/repositories/entities';
import { RemoteRdpEntity } from '../../../jump-item/remote-rdp/repositories/entities';
import { RemoteVncEntity } from '../../../jump-item/remote-vnc/repositories/entities';
import { ShellJumpEntity } from '../../../jump-item/shell-jump/repositories/entities';
import { WebJumpEntity } from '../../../jump-item/web-jump/repositories/entities';
import { DateUtility } from '../../../shared/utilities';
import { JumpointPlatformType, JzpClientAddressRestrictionsType } from '../../enums';
import { mapFromBTJumpointPlatformType, mapFromBTJzpClientAddressRestrictionsType } from '../../mappers';
import { Jumpoint, JumpointIpRange } from '../../models';
import { JumpointNodeEntity } from './jumpoint-node.entity';

export class JumpointEntity implements Jumpoint {
    public id!: number;
    public name!: string;
    public platformType!: JumpointPlatformType;
    public codeName?: string;
    public comments?: string;
    public isEnabled?: boolean;
    public isConnected?: boolean;
    public isClustered?: boolean;
    public isShellJumpEnabled?: boolean;
    public externalJumpItemNetworkId?: string;
    public isProtocolTunnelEnabled?: boolean;
    public rdpServiceAccountId?: number | null;
    public managedIpRanges?: JumpointIpRange[];
    public isJzpEnabled?: boolean;
    public jzpProxyHostname?: string;
    public jzpProxyPort?: number;
    public isJzpHttpGetAllowed?: boolean;
    public jzpClientAddressRestrictionsType?: JzpClientAddressRestrictionsType;
    public jzpRestrictedIps?: string[];
    public dockerDeployKey?: string;
    public keyInfo?: string;
    public lastSyncDate!: Date;
    public groupPolicyJumpoints?: GroupPolicyJumpointEntity[];
    public protocolTunnelJumps?: ProtocolTunnelJumpEntity[];
    public remoteRdps?: RemoteRdpEntity[];
    public remoteVncs?: RemoteVncEntity[];
    public shellJumps?: ShellJumpEntity[];
    public webJumps?: WebJumpEntity[];
    public jumpointNodes?: JumpointNodeEntity[];

    public static create(
        id: number,
        name: string,
        platformType: JumpointPlatformType,
        codeName?: string,
        comments?: string,
        isEnabled?: boolean,
        isConnected?: boolean,
        isClustered?: boolean,
        isShellJumpEnabled?: boolean,
        externalJumpItemNetworkId?: string,
        isProtocolTunnelEnabled?: boolean,
        rdpServiceAccountId?: number | null,
        managedIpRanges?: JumpointIpRange[],
        isJzpEnabled?: boolean,
        jzpProxyHostname?: string,
        jzpProxyPort?: number,
        isJzpHttpGetAllowed?: boolean,
        jzpClientAddressRestrictionsType?: JzpClientAddressRestrictionsType,
        jzpRestrictedIps?: string[],
        dockerDeployKey?: string,
        keyInfo?: string,
    ): JumpointEntity {
        const entity = new JumpointEntity();
        entity.id = id;
        entity.name = name;
        entity.platformType = platformType;
        entity.codeName = codeName;
        entity.comments = comments;
        entity.isEnabled = isEnabled;
        entity.isConnected = isConnected;
        entity.isClustered = isClustered;
        entity.isShellJumpEnabled = isShellJumpEnabled;
        entity.externalJumpItemNetworkId = externalJumpItemNetworkId;
        entity.isProtocolTunnelEnabled = isProtocolTunnelEnabled;
        entity.rdpServiceAccountId = rdpServiceAccountId;
        entity.managedIpRanges = managedIpRanges;
        entity.isJzpEnabled = isJzpEnabled;
        entity.jzpProxyHostname = jzpProxyHostname;
        entity.jzpProxyPort = jzpProxyPort;
        entity.isJzpHttpGetAllowed = isJzpHttpGetAllowed;
        entity.jzpClientAddressRestrictionsType = jzpClientAddressRestrictionsType;
        entity.jzpRestrictedIps = jzpRestrictedIps;
        entity.dockerDeployKey = dockerDeployKey;
        entity.keyInfo = keyInfo;
        entity.lastSyncDate = DateUtility.getCurrentUtcDate();

        return entity;
    }

    public static createFromBT(btJumpoint: BTJumpoint) {
        return JumpointEntity.create(
            btJumpoint.id,
            btJumpoint.name,
            mapFromBTJumpointPlatformType(btJumpoint.platform),
            btJumpoint.codeName,
            btJumpoint.comments,
            btJumpoint.enabled,
            btJumpoint.connected,
            btJumpoint.clustered,
            btJumpoint.shellJumpEnabled,
            btJumpoint.externalJumpItemNetworkId,
            btJumpoint.protocolTunnelEnabled,
            btJumpoint.rdpServiceAccountId,
            btJumpoint.managedIpRanges,
            btJumpoint.jzpEnabled,
            btJumpoint.jzpProxyHostname,
            btJumpoint.jzpProxyPort,
            btJumpoint.jzpAllowHttpGet,
            btJumpoint.jzpClientAddressRestrictionsType
                ? mapFromBTJzpClientAddressRestrictionsType(btJumpoint.jzpClientAddressRestrictionsType)
                : undefined,
            btJumpoint.jzpRestrictedIps,
            btJumpoint.dockerDeployKey,
            btJumpoint.keyInfo,
        );
    }
}
