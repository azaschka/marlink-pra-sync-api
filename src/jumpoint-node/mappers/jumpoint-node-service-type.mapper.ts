import { NodeServiceType as SMNodeServiceType } from '../../service-manager-api/nodes/enums';
import { JumpointNodeServiceType } from '../enums';

export function mapFromSMNodeServiceType(smNodeServiceType: SMNodeServiceType): JumpointNodeServiceType {
    switch (smNodeServiceType) {
        case SMNodeServiceType.Pra:
            return JumpointNodeServiceType.Pra;
        default:
            throw new Error(`Unknown SMNodeServiceType: ${smNodeServiceType}`);
    }
}

export function mapToSMNodeServiceType(nodeServiceType: JumpointNodeServiceType): SMNodeServiceType {
    switch (nodeServiceType) {
        case JumpointNodeServiceType.Pra:
            return SMNodeServiceType.Pra;
        default:
            throw new Error(`Unknown JumpointNodeServiceType: ${nodeServiceType}`);
    }
}
