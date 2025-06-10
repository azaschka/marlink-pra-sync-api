import { WebJumpUsernameFormatType as BTWebJumpUsernameFormatType } from '../../../beyondtrust-pra-conf-api/jump-item/web-jump/enums';
import { WebJumpUsernameFormatType } from '../enums';
import {
    mapFromBTWebJumpUsernameFormatType,
    mapToBTWebJumpUsernameFormatType,
} from './web-jump-username-format-type.mapper';

describe('mapFromBTWebJumpUsernameFormatType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTWebJumpUsernameFormatType).length;
        const enumSize = Object.keys(WebJumpUsernameFormatType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [BTWebJumpUsernameFormatType.Default, WebJumpUsernameFormatType.Default],
        [BTWebJumpUsernameFormatType.ForceDllnFormat, WebJumpUsernameFormatType.ForceDllnFormat],
        [BTWebJumpUsernameFormatType.ForceUpnFormat, WebJumpUsernameFormatType.ForceUpnFormat],
        [BTWebJumpUsernameFormatType.UsernameOnly, WebJumpUsernameFormatType.UsernameOnly],
    ])('should map %s to %s', (input: BTWebJumpUsernameFormatType, expected: WebJumpUsernameFormatType) => {
        const result = mapFromBTWebJumpUsernameFormatType(input);
        expect(result).toEqual(expected);
    });

    it('should throw an error for unknown BTWebJumpUsernameFormatType', () => {
        const unknownType = {} as BTWebJumpUsernameFormatType;
        expect(() => mapFromBTWebJumpUsernameFormatType(unknownType)).toThrow();
    });
});

describe('mapToBTWebJumpUsernameFormatType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTWebJumpUsernameFormatType).length;
        const enumSize = Object.keys(WebJumpUsernameFormatType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [WebJumpUsernameFormatType.Default, BTWebJumpUsernameFormatType.Default],
        [WebJumpUsernameFormatType.ForceDllnFormat, BTWebJumpUsernameFormatType.ForceDllnFormat],
        [WebJumpUsernameFormatType.ForceUpnFormat, BTWebJumpUsernameFormatType.ForceUpnFormat],
        [WebJumpUsernameFormatType.UsernameOnly, BTWebJumpUsernameFormatType.UsernameOnly],
    ])('should map %s to %s', (input: WebJumpUsernameFormatType, expected: BTWebJumpUsernameFormatType) => {
        const result = mapToBTWebJumpUsernameFormatType(input);
        expect(result).toEqual(expected);
    });

    it('should throw an error for unknown WebJumpUsernameFormatType', () => {
        const unknownType = {} as WebJumpUsernameFormatType;
        expect(() => mapToBTWebJumpUsernameFormatType(unknownType)).toThrow();
    });
});
