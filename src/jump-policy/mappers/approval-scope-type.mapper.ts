import { ApprovalScopeType as BTApprovalScopeType } from '../../beyondtrust-pra-conf-api/jump-policy/enums';
import { ApprovalScopeType } from '../enums';

export function mapFromBTApprovalScopeType(btApprovalScopeType: BTApprovalScopeType): ApprovalScopeType {
    switch (btApprovalScopeType) {
        case BTApprovalScopeType.Anyone:
            return ApprovalScopeType.Anyone;
        case BTApprovalScopeType.Requestor:
            return ApprovalScopeType.Requestor;
        default:
            throw new Error(`Unknown BTApprovalScopeType: ${btApprovalScopeType}`);
    }
}

export function mapToBTApprovalScopeType(approvalScopeType: ApprovalScopeType): BTApprovalScopeType {
    switch (approvalScopeType) {
        case ApprovalScopeType.Anyone:
            return BTApprovalScopeType.Anyone;
        case ApprovalScopeType.Requestor:
            return BTApprovalScopeType.Requestor;
        default:
            throw new Error(`Unknown ApprovalScopeType: ${approvalScopeType}`);
    }
}
