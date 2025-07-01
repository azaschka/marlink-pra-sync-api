import { JumpClientEndpointAgreementPolicyType as BTJumpClientEndpointAgreementPolicyType } from '../../beyondtrust-pra-conf-api/jump-client/enums';
import { JumpClientEndpointAgreementPolicyType } from '../enums';
import {
    mapFromBTJumpClientEndpointAgreementPolicyType,
    mapToBTJumpClientEndpointAgreementPolicyType,
} from './jump-client-endpoint-agreement-policy-type.mapper';

describe('mapFromBTJumpClientEndpointAgreementPolicyType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTJumpClientEndpointAgreementPolicyType).length;
        const enumSize = Object.keys(JumpClientEndpointAgreementPolicyType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [BTJumpClientEndpointAgreementPolicyType.Accept, JumpClientEndpointAgreementPolicyType.Accept],
        [BTJumpClientEndpointAgreementPolicyType.NoPrompt, JumpClientEndpointAgreementPolicyType.NoPrompt],
        [BTJumpClientEndpointAgreementPolicyType.Reject, JumpClientEndpointAgreementPolicyType.Reject],
    ])(
        'should map %s to %s',
        (input: BTJumpClientEndpointAgreementPolicyType, expected: JumpClientEndpointAgreementPolicyType) => {
            const result = mapFromBTJumpClientEndpointAgreementPolicyType(input);
            expect(result).toEqual(expected);
        },
    );

    it('should throw an error for unknown BTJumpClientEndpointAgreementPolicyType', () => {
        const unknownType = {} as BTJumpClientEndpointAgreementPolicyType;
        expect(() => mapFromBTJumpClientEndpointAgreementPolicyType(unknownType)).toThrow();
    });
});

describe('mapToBTJumpClientEndpointAgreementPolicyType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTJumpClientEndpointAgreementPolicyType).length;
        const enumSize = Object.keys(JumpClientEndpointAgreementPolicyType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [JumpClientEndpointAgreementPolicyType.Accept, BTJumpClientEndpointAgreementPolicyType.Accept],
        [JumpClientEndpointAgreementPolicyType.NoPrompt, BTJumpClientEndpointAgreementPolicyType.NoPrompt],
        [JumpClientEndpointAgreementPolicyType.Reject, BTJumpClientEndpointAgreementPolicyType.Reject],
    ])(
        'should map %s to %s',
        (input: JumpClientEndpointAgreementPolicyType, expected: BTJumpClientEndpointAgreementPolicyType) => {
            const result = mapToBTJumpClientEndpointAgreementPolicyType(input);
            expect(result).toEqual(expected);
        },
    );

    it('should throw an error for unknown JumpClientEndpointAgreementPolicyType', () => {
        const unknownType = {} as JumpClientEndpointAgreementPolicyType;
        expect(() => mapToBTJumpClientEndpointAgreementPolicyType(unknownType)).toThrow();
    });
});
