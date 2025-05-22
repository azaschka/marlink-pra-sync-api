import { ApprovalApproverScopeType as BTApprovalApproverScopeType } from '../../beyondtrust-pra-conf-api/jump-policy/enums';
import { ApprovalApproverScopeType } from '../enums';
import {
    mapFromBTApprovalApproverScopeType,
    mapToBTApprovalApproverScopeType,
} from './approval-approver-scope-type.mapper';

describe('mapFromBTApprovalApproverScopeType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTApprovalApproverScopeType).length;
        const enumSize = Object.keys(ApprovalApproverScopeType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [BTApprovalApproverScopeType.Anyone, ApprovalApproverScopeType.Anyone],
        [BTApprovalApproverScopeType.NotRequestor, ApprovalApproverScopeType.NotRequestor],
    ])('should map %s to %s', (input: BTApprovalApproverScopeType, expected: ApprovalApproverScopeType) => {
        const result = mapFromBTApprovalApproverScopeType(input);
        expect(result).toEqual(expected);
    });

    it('should throw an error for unknown BTApprovalApproverScopeType', () => {
        const unknownType = {} as BTApprovalApproverScopeType;
        expect(() => mapFromBTApprovalApproverScopeType(unknownType)).toThrow();
    });
});

describe('mapToBTApprovalApproverScopeType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTApprovalApproverScopeType).length;
        const enumSize = Object.keys(ApprovalApproverScopeType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [ApprovalApproverScopeType.Anyone, BTApprovalApproverScopeType.Anyone],
        [ApprovalApproverScopeType.NotRequestor, BTApprovalApproverScopeType.NotRequestor],
    ])('should map %s to %s', (input: ApprovalApproverScopeType, expected: BTApprovalApproverScopeType) => {
        const result = mapToBTApprovalApproverScopeType(input);
        expect(result).toEqual(expected);
    });

    it('should throw an error for unknown ApprovalApproverScopeType', () => {
        const unknownType = {} as ApprovalApproverScopeType;
        expect(() => mapToBTApprovalApproverScopeType(unknownType)).toThrow();
    });
});
