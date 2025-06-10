import { TunnelType as BTTunnelType } from '../../../beyondtrust-pra-conf-api/jump-item/protocol-tunnel-jump/enums';
import { TunnelType } from '../enums';
import { mapFromBTTunnelType, mapToBTTunnelType } from './tunnel-type.mapper';

describe('mapFromBTTunnelType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTTunnelType).length;
        const enumSize = Object.keys(TunnelType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [BTTunnelType.K8s, TunnelType.K8s],
        [BTTunnelType.Mssql, TunnelType.Mssql],
        [BTTunnelType.Tcp, TunnelType.Tcp],
        [BTTunnelType.Ip, TunnelType.Ip],
    ])('should map %s to %s', (input: BTTunnelType, expected: TunnelType) => {
        const result = mapFromBTTunnelType(input);
        expect(result).toEqual(expected);
    });

    it('should throw an error for unknown BTTunnelType', () => {
        const unknownType = {} as BTTunnelType;
        expect(() => mapFromBTTunnelType(unknownType)).toThrow();
    });
});

describe('mapToBTTunnelType', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTTunnelType).length;
        const enumSize = Object.keys(TunnelType).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [TunnelType.K8s, BTTunnelType.K8s],
        [TunnelType.Mssql, BTTunnelType.Mssql],
        [TunnelType.Tcp, BTTunnelType.Tcp],
        [TunnelType.Ip, BTTunnelType.Ip],
    ])('should map %s to %s', (input: TunnelType, expected: BTTunnelType) => {
        const result = mapToBTTunnelType(input);
        expect(result).toEqual(expected);
    });

    it('should throw an error for unknown TunnelType', () => {
        const unknownType = {} as TunnelType;
        expect(() => mapToBTTunnelType(unknownType)).toThrow();
    });
});
