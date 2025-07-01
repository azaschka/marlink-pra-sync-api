import { JumpClientUnavailableReasonType as BTJumpClientUnavailableReasonType } from '../../beyondtrust-pra-conf-api/jump-client/enums';
import { JumpClientUnavailableReasonType } from '../enums';
import { mapFromBTJumpClientUnavailableReasonType } from './jump-client-unavailable-reason-type.mapper';

describe('mapFromBTJumpClientUnavailableReasonType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTJumpClientUnavailableReasonType).length;
        const enumSize = Object.keys(JumpClientUnavailableReasonType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [BTJumpClientUnavailableReasonType.Disabled, JumpClientUnavailableReasonType.Disabled],
        [BTJumpClientUnavailableReasonType.None, JumpClientUnavailableReasonType.None],
    ])('should map %s to %s', (input, expected) => {
        const result = mapFromBTJumpClientUnavailableReasonType(input);
        expect(result).toBe(expected);
    });

    it('should throw an error for unknown BTJumpClientUnavailableReasonType', () => {
        const unknownType = {} as BTJumpClientUnavailableReasonType;
        expect(() => mapFromBTJumpClientUnavailableReasonType(unknownType)).toThrow();
    });
});
