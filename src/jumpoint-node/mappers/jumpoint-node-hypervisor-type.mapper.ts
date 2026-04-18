import { HypervisorType as SMHypervisorType } from '../../service-manager-api/nodes/enums';
import { JumpointNodeHypervisorType } from '../enums';

export function mapFromSMHypervisorType(smHypervisorType: SMHypervisorType): JumpointNodeHypervisorType {
    switch (smHypervisorType) {
        case SMHypervisorType.OneEdge:
            return JumpointNodeHypervisorType.OneEdge;
        case SMHypervisorType.XCPower:
            return JumpointNodeHypervisorType.XCPower;
        default:
            throw new Error(`Unknown SMHypervisorType: ${smHypervisorType}`);
    }
}

export function mapToSMHypervisorType(hypervisorType: JumpointNodeHypervisorType): SMHypervisorType {
    switch (hypervisorType) {
        case JumpointNodeHypervisorType.OneEdge:
            return SMHypervisorType.OneEdge;
        case JumpointNodeHypervisorType.XCPower:
            return SMHypervisorType.XCPower;
        default:
            throw new Error(`Unknown JumpointNodeHypervisorType: ${hypervisorType}`);
    }
}
