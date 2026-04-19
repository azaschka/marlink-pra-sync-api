import {
    BusinessUnit as SMBusinessUnit,
    BusinessUnitFullName as SMBusinessUnitFullName,
} from '../../../service-manager-api/nodes/enums';
import { JumpointNodeBusinessUnit } from '../enums';

export function mapFromSmBusinessUnitFullName(smBusinessUnit: SMBusinessUnitFullName): JumpointNodeBusinessUnit {
    switch (smBusinessUnit) {
        case SMBusinessUnitFullName.EEG:
            return JumpointNodeBusinessUnit.EG;
        case SMBusinessUnitFullName.MarlinkCyber:
            return JumpointNodeBusinessUnit.MC;
        case SMBusinessUnitFullName.Maritime:
            return JumpointNodeBusinessUnit.MT;
        case SMBusinessUnitFullName.OmniAccess:
            return JumpointNodeBusinessUnit.OA;
        case SMBusinessUnitFullName.Telemar:
            return JumpointNodeBusinessUnit.TE;
        default:
            throw new Error(`Unknown SMBusinessUnitFullName: ${smBusinessUnit}`);
    }
}

export function mapFromSMBusinessUnit(smBusinessUnit: SMBusinessUnit): JumpointNodeBusinessUnit {
    switch (smBusinessUnit) {
        case SMBusinessUnit.EG:
            return JumpointNodeBusinessUnit.EG;
        case SMBusinessUnit.MC:
            return JumpointNodeBusinessUnit.MC;
        case SMBusinessUnit.MT:
            return JumpointNodeBusinessUnit.MT;
        case SMBusinessUnit.OA:
            return JumpointNodeBusinessUnit.OA;
        case SMBusinessUnit.TE:
            return JumpointNodeBusinessUnit.TE;
        default:
            throw new Error(`Unknown SMBusinessUnit: ${smBusinessUnit}`);
    }
}

export function mapToSMBusinessUnit(businessUnit: JumpointNodeBusinessUnit): SMBusinessUnit {
    switch (businessUnit) {
        case JumpointNodeBusinessUnit.EG:
            return SMBusinessUnit.EG;
        case JumpointNodeBusinessUnit.MC:
            return SMBusinessUnit.MC;
        case JumpointNodeBusinessUnit.MT:
            return SMBusinessUnit.MT;
        case JumpointNodeBusinessUnit.OA:
            return SMBusinessUnit.OA;
        case JumpointNodeBusinessUnit.TE:
            return SMBusinessUnit.TE;
        default:
            throw new Error(`Unknown JumpointNodeBusinessUnit: ${businessUnit}`);
    }
}
