import { NodeServiceType as SMNodeServiceType } from '../../service-manager-api/nodes/enums';
import { JumpointNodeServiceType } from '../enums';
import { mapFromSMNodeServiceType, mapToSMNodeServiceType } from './jumpoint-node-service-type.mapper';

describe('mapFromSMNodeServiceType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(SMNodeServiceType).length;
        const enumSize = Object.keys(JumpointNodeServiceType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([[SMNodeServiceType.Pra, JumpointNodeServiceType.Pra]])(
        'should map %s to %s',
        (input: SMNodeServiceType, expected: JumpointNodeServiceType) => {
            const result = mapFromSMNodeServiceType(input);
            expect(result).toEqual(expected);
        },
    );

    it('should throw an error for unknown SMNodeServiceType', () => {
        const unknownType = {} as SMNodeServiceType;
        expect(() => mapFromSMNodeServiceType(unknownType)).toThrow();
    });
});

describe('mapToSMNodeServiceType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(SMNodeServiceType).length;
        const enumSize = Object.keys(JumpointNodeServiceType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([[JumpointNodeServiceType.Pra, SMNodeServiceType.Pra]])(
        'should map %s to %s',
        (input: JumpointNodeServiceType, expected: SMNodeServiceType) => {
            const result = mapToSMNodeServiceType(input);
            expect(result).toEqual(expected);
        },
    );

    it('should throw an error for unknown JumpointNodeServiceType', () => {
        const unknownType = {} as JumpointNodeServiceType;
        expect(() => mapToSMNodeServiceType(unknownType)).toThrow();
    });
});
