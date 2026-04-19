import {
    BusinessUnit as SMBusinessUnit,
    BusinessUnitFullName as SMBusinessUnitFullName,
} from '../../../service-manager-api/nodes/enums';
import { JumpointNodeBusinessUnit } from '../enums';
import {
    mapFromSMBusinessUnit,
    mapFromSmBusinessUnitFullName,
    mapToSMBusinessUnit,
} from './jumpoint-node-business-unit.mapper';

describe('mapFromSmBusinessUnitFullName', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(SMBusinessUnitFullName).length;
        const enumSize = Object.keys(JumpointNodeBusinessUnit).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [SMBusinessUnitFullName.EEG, JumpointNodeBusinessUnit.EG],
        [SMBusinessUnitFullName.MarlinkCyber, JumpointNodeBusinessUnit.MC],
        [SMBusinessUnitFullName.Maritime, JumpointNodeBusinessUnit.MT],
        [SMBusinessUnitFullName.OmniAccess, JumpointNodeBusinessUnit.OA],
        [SMBusinessUnitFullName.Telemar, JumpointNodeBusinessUnit.TE],
    ])('should map %s to %s', (input: SMBusinessUnitFullName, expected: JumpointNodeBusinessUnit) => {
        const result = mapFromSmBusinessUnitFullName(input);
        expect(result).toEqual(expected);
    });

    it('should throw an error for unknown SMBusinessUnitFullName', () => {
        const unknownType = {} as SMBusinessUnitFullName;
        expect(() => mapFromSmBusinessUnitFullName(unknownType)).toThrow();
    });
});

describe('mapFromSMBusinessUnit', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(SMBusinessUnit).length;
        const enumSize = Object.keys(JumpointNodeBusinessUnit).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [SMBusinessUnit.EG, JumpointNodeBusinessUnit.EG],
        [SMBusinessUnit.MC, JumpointNodeBusinessUnit.MC],
        [SMBusinessUnit.MT, JumpointNodeBusinessUnit.MT],
        [SMBusinessUnit.OA, JumpointNodeBusinessUnit.OA],
        [SMBusinessUnit.TE, JumpointNodeBusinessUnit.TE],
    ])('should map %s to %s', (input: SMBusinessUnit, expected: JumpointNodeBusinessUnit) => {
        const result = mapFromSMBusinessUnit(input);
        expect(result).toEqual(expected);
    });

    it('should throw an error for unknown SMBusinessUnit', () => {
        const unknownType = {} as SMBusinessUnit;
        expect(() => mapFromSMBusinessUnit(unknownType)).toThrow();
    });
});

describe('mapToSMBusinessUnit', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(SMBusinessUnit).length;
        const enumSize = Object.keys(JumpointNodeBusinessUnit).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [JumpointNodeBusinessUnit.EG, SMBusinessUnit.EG],
        [JumpointNodeBusinessUnit.MC, SMBusinessUnit.MC],
        [JumpointNodeBusinessUnit.MT, SMBusinessUnit.MT],
        [JumpointNodeBusinessUnit.OA, SMBusinessUnit.OA],
        [JumpointNodeBusinessUnit.TE, SMBusinessUnit.TE],
    ])('should map %s to %s', (input: JumpointNodeBusinessUnit, expected: SMBusinessUnit) => {
        const result = mapToSMBusinessUnit(input);
        expect(result).toEqual(expected);
    });

    it('should throw an error for unknown JumpointNodeBusinessUnit', () => {
        const unknownType = {} as JumpointNodeBusinessUnit;
        expect(() => mapToSMBusinessUnit(unknownType)).toThrow();
    });
});
