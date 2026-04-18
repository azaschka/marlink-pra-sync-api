import { HypervisorType as SMHypervisorType } from '../../../service-manager-api/nodes/enums';
import { JumpointNodeHypervisorType } from '../enums';
import { mapFromSMHypervisorType, mapToSMHypervisorType } from './jumpoint-node-hypervisor-type.mapper';

describe('mapFromSMHypervisorType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(SMHypervisorType).length;
        const enumSize = Object.keys(JumpointNodeHypervisorType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [SMHypervisorType.OneEdge, JumpointNodeHypervisorType.OneEdge],
        [SMHypervisorType.XCPower, JumpointNodeHypervisorType.XCPower],
    ])('should map %s to %s', (input: SMHypervisorType, expected: JumpointNodeHypervisorType) => {
        const result = mapFromSMHypervisorType(input);
        expect(result).toEqual(expected);
    });

    it('should throw an error for unknown SMHypervisorType', () => {
        const unknownType = {} as SMHypervisorType;
        expect(() => mapFromSMHypervisorType(unknownType)).toThrow();
    });
});

describe('mapToSMHypervisorType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(SMHypervisorType).length;
        const enumSize = Object.keys(JumpointNodeHypervisorType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [JumpointNodeHypervisorType.OneEdge, SMHypervisorType.OneEdge],
        [JumpointNodeHypervisorType.XCPower, SMHypervisorType.XCPower],
    ])('should map %s to %s', (input: JumpointNodeHypervisorType, expected: SMHypervisorType) => {
        const result = mapToSMHypervisorType(input);
        expect(result).toEqual(expected);
    });

    it('should throw an error for unknown JumpointNodeHypervisorType', () => {
        const unknownType = {} as JumpointNodeHypervisorType;
        expect(() => mapToSMHypervisorType(unknownType)).toThrow();
    });
});
