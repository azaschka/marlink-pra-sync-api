import { ApprovalScopeType as BTApprovalScopeType } from '../../beyondtrust-pra-conf-api/jump-policy/enums';
import { ApprovalScopeType } from '../enums';
import { mapFromBTApprovalScopeType, mapToBTApprovalScopeType } from './approval-scope-type.mapper';

describe('mapFromBTApprovalScopeType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTApprovalScopeType).length;
        const enumSize = Object.keys(ApprovalScopeType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [BTApprovalScopeType.Anyone, ApprovalScopeType.Anyone],
        [BTApprovalScopeType.Requestor, ApprovalScopeType.Requestor],
    ])('should map %s to %s', (input: BTApprovalScopeType, expected: ApprovalScopeType) => {
        const result = mapFromBTApprovalScopeType(input);
        expect(result).toEqual(expected);
    });

    it('should throw an error for unknown BTApprovalScopeType', () => {
        const unknownType = {} as BTApprovalScopeType;
        expect(() => mapFromBTApprovalScopeType(unknownType)).toThrow();
    });
});

describe('mapToBTApprovalScopeType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTApprovalScopeType).length;
        const enumSize = Object.keys(ApprovalScopeType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [ApprovalScopeType.Anyone, BTApprovalScopeType.Anyone],
        [ApprovalScopeType.Requestor, BTApprovalScopeType.Requestor],
    ])('should map %s to %s', (input: ApprovalScopeType, expected: BTApprovalScopeType) => {
        const result = mapToBTApprovalScopeType(input);
        expect(result).toEqual(expected);
    });

    it('should throw an error for unknown ApprovalScopeType', () => {
        const unknownType = {} as ApprovalScopeType;
        expect(() => mapToBTApprovalScopeType(unknownType)).toThrow();
    });
});
