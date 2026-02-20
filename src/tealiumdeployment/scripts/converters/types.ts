export type Condition = {
    variable: string,
    operator: string | null,
    value: string | null
}

export type ConfigurationGroup = {
    configs: Configuration[]
}

export type Configuration = {
    setoption: string,
    set: string,
    settotext: string,
    settovar: string,
}

export type PersistDataValueConfiguration = Configuration & {
    var: string,
    allowupdate: string,
    persistence: string
}

export type JoinDataValuesConfiguration = Configuration & {
    [key: `${number}_set_text`]: string | undefined
    leadingdelimiter: boolean
    var: string,
    delimiter: string,
    defaultvalue: string,
    configs: {
        set?: 'textvalue' | string
        text?: string
    }[]
}


export type PathnameTokenizerConfig = {}

export type LookupTableConfiguration = {
    configs: Array<{
        name?: string;
        comment?: string;
        value?: string;
        logic?: string;
    }>;
    vartype: string;
    settotext?: string;
    var: string;
    constructor?: string;
    filtertype: 'equals' | 'contains';
    initialize?: string;
    varlookup: string;
}

export type CryptoConfiguration = {
    constructor?: string;
    initialize?: string;
    hash: string; // "1" = MD5, "2" = SHA-1, "3" = SHA-256
}

export type ExtensionData = {
    name: string,
    id: number,
    scope: string,
    extensionType: string,
    occurrence: string | null,
    loadRule: string | null,
    conditions: Condition[][],
    configuration: JoinDataValuesConfiguration | PersistDataValueConfiguration | ConfigurationGroup | LookupTableConfiguration | PathnameTokenizerConfig | CryptoConfiguration
}

export interface Converter {
    convert(extension: ExtensionData): string | false;
}