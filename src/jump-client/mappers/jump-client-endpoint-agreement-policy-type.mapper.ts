import { JumpClientEndpointAgreementPolicyType as BTJumpClientEndpointAgreementPolicyType } from '../../beyondtrust-pra-conf-api/jump-client/enums';
import { JumpClientEndpointAgreementPolicyType } from '../enums';

export function mapFromBTJumpClientEndpointAgreementPolicyType(
    btJumpClientEndpointAgreementPolicyType: BTJumpClientEndpointAgreementPolicyType,
): JumpClientEndpointAgreementPolicyType {
    switch (btJumpClientEndpointAgreementPolicyType) {
        case BTJumpClientEndpointAgreementPolicyType.Accept:
            return JumpClientEndpointAgreementPolicyType.Accept;
        case BTJumpClientEndpointAgreementPolicyType.NoPrompt:
            return JumpClientEndpointAgreementPolicyType.NoPrompt;
        case BTJumpClientEndpointAgreementPolicyType.Reject:
            return JumpClientEndpointAgreementPolicyType.Reject;
        default:
            throw new Error(
                `Unknown BTJumpClientEndpointAgreementPolicyType: ${btJumpClientEndpointAgreementPolicyType}`,
            );
    }
}

export function mapToBTJumpClientEndpointAgreementPolicyType(
    jumpClientEndpointAgreementPolicyType: JumpClientEndpointAgreementPolicyType,
): BTJumpClientEndpointAgreementPolicyType {
    switch (jumpClientEndpointAgreementPolicyType) {
        case JumpClientEndpointAgreementPolicyType.Accept:
            return BTJumpClientEndpointAgreementPolicyType.Accept;
        case JumpClientEndpointAgreementPolicyType.NoPrompt:
            return BTJumpClientEndpointAgreementPolicyType.NoPrompt;
        case JumpClientEndpointAgreementPolicyType.Reject:
            return BTJumpClientEndpointAgreementPolicyType.Reject;
        default:
            throw new Error(`Unknown JumpClientEndpointAgreementPolicyType: ${jumpClientEndpointAgreementPolicyType}`);
    }
}
