import { RdpQualityMode as BTRdpQualityMode } from '../../../beyondtrust-pra-conf-api/jump-item/remote-rdp/enums';
import { RdpQualityMode } from '../enums';

export function mapFromBTRdpQualityMode(btRdpQualityMode: BTRdpQualityMode): RdpQualityMode {
    switch (btRdpQualityMode) {
        case BTRdpQualityMode.Lossless:
            return RdpQualityMode.Lossless;
        case BTRdpQualityMode.Performance:
            return RdpQualityMode.Performance;
        case BTRdpQualityMode.BestPerformance:
            return RdpQualityMode.BestPerformance;
        case BTRdpQualityMode.PerformanceQuality:
            return RdpQualityMode.PerformanceQuality;
        case BTRdpQualityMode.Quality:
            return RdpQualityMode.Quality;
        case BTRdpQualityMode.Video:
            return RdpQualityMode.Video;
        case BTRdpQualityMode.Low:
            return RdpQualityMode.Low;
        default:
            throw new Error(`Unknown BTRdpQualityMode: ${btRdpQualityMode}`);
    }
}

export function mapToBTRdpQualityMode(rdpQualityMode: RdpQualityMode): BTRdpQualityMode {
    switch (rdpQualityMode) {
        case RdpQualityMode.Lossless:
            return BTRdpQualityMode.Lossless;
        case RdpQualityMode.Performance:
            return BTRdpQualityMode.Performance;
        case RdpQualityMode.BestPerformance:
            return BTRdpQualityMode.BestPerformance;
        case RdpQualityMode.PerformanceQuality:
            return BTRdpQualityMode.PerformanceQuality;
        case RdpQualityMode.Quality:
            return BTRdpQualityMode.Quality;
        case RdpQualityMode.Video:
            return BTRdpQualityMode.Video;
        case RdpQualityMode.Low:
            return BTRdpQualityMode.Low;
        default:
            throw new Error(`Unknown RdpQualityMode: ${rdpQualityMode}`);
    }
}
