import { ApprovalApproverScopeType as BTApprovalApproverScopeType } from '../../beyondtrust-pra-conf-api/jump-policy/enums';
import { ApprovalApproverScopeType } from '../enums';

export function mapFromBTApprovalApproverScopeType(
    btApprovalApproverScopeType: BTApprovalApproverScopeType,
): ApprovalApproverScopeType {
    switch (btApprovalApproverScopeType) {
        case BTApprovalApproverScopeType.Anyone:
            return ApprovalApproverScopeType.Anyone;
        case BTApprovalApproverScopeType.NotRequestor:
            return ApprovalApproverScopeType.NotRequestor;
        default:
            throw new Error(`Unknown BTApprovalApproverScopeType: ${btApprovalApproverScopeType}`);
    }
}

export function mapToBTApprovalApproverScopeType(
    approvalApproverScopeType: ApprovalApproverScopeType,
): BTApprovalApproverScopeType {
    switch (approvalApproverScopeType) {
        case ApprovalApproverScopeType.Anyone:
            return BTApprovalApproverScopeType.Anyone;
        case ApprovalApproverScopeType.NotRequestor:
            return BTApprovalApproverScopeType.NotRequestor;
        default:
            throw new Error(`Unknown ApprovalApproverScopeType: ${approvalApproverScopeType}`);
    }
}
