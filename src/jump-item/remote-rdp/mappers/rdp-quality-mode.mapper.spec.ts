import { RdpQualityMode as BTRdpQualityMode } from '../../../beyondtrust-pra-conf-api/jump-item/remote-rdp/enums';
import { RdpQualityMode } from '../enums';
import { mapFromBTRdpQualityMode, mapToBTRdpQualityMode } from './rdp-quality-mode.mapper';

describe('mapFromBTRdpQualityMode', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTRdpQualityMode).length;
        const enumSize = Object.keys(RdpQualityMode).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [BTRdpQualityMode.Lossless, RdpQualityMode.Lossless],
        [BTRdpQualityMode.Performance, RdpQualityMode.Performance],
        [BTRdpQualityMode.BestPerformance, RdpQualityMode.BestPerformance],
        [BTRdpQualityMode.PerformanceQuality, RdpQualityMode.PerformanceQuality],
        [BTRdpQualityMode.Quality, RdpQualityMode.Quality],
        [BTRdpQualityMode.Video, RdpQualityMode.Video],
        [BTRdpQualityMode.Low, RdpQualityMode.Low],
    ])('should map %s to %s', (input: BTRdpQualityMode, expected: RdpQualityMode) => {
        const result = mapFromBTRdpQualityMode(input);
        expect(result).toEqual(expected);
    });

    it('should throw an error for unknown BTRdpQualityMode', () => {
        const unknownType = {} as BTRdpQualityMode;
        expect(() => mapFromBTRdpQualityMode(unknownType)).toThrow();
    });
});

describe('mapToBTRdpQualityMode', () => {
    it('should have same enum sizes', () => {
        const btEnumSize = Object.keys(BTRdpQualityMode).length;
        const enumSize = Object.keys(RdpQualityMode).length;
        expect(btEnumSize).toEqual(enumSize);
    });

    it.each([
        [RdpQualityMode.Lossless, BTRdpQualityMode.Lossless],
        [RdpQualityMode.Performance, BTRdpQualityMode.Performance],
        [RdpQualityMode.BestPerformance, BTRdpQualityMode.BestPerformance],
        [RdpQualityMode.PerformanceQuality, BTRdpQualityMode.PerformanceQuality],
        [RdpQualityMode.Quality, BTRdpQualityMode.Quality],
        [RdpQualityMode.Video, BTRdpQualityMode.Video],
        [RdpQualityMode.Low, BTRdpQualityMode.Low],
    ])('should map %s to %s', (input: RdpQualityMode, expected: BTRdpQualityMode) => {
        const result = mapToBTRdpQualityMode(input);
        expect(result).toEqual(expected);
    });

    it('should throw an error for unknown RdpQualityMode', () => {
        const unknownType = {} as RdpQualityMode;
        expect(() => mapToBTRdpQualityMode(unknownType)).toThrow();
    });
});
