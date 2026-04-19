export enum BusinessUnit {
    MT = 'MT',
    OA = 'OA',
    MC = 'MC',
    EG = 'EG',
    TE = 'TE',
}

// These are the full names of the abbreviations above.
// This enum is used by the service manager API as a response in the nodes endpoint.
export enum BusinessUnitFullName {
    Maritime = 'Maritime',
    OmniAccess = 'OmniAccess',
    MarlinkCyber = 'Marlink Cyber',
    EEG = 'EEG',
    Telemar = 'Telemar',
}
