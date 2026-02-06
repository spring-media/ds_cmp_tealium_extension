export type Condition = {
    variable: string,
    operator: string,
    value: string,
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

export type ExtensionData = {
    name: string,
    id: number,
    scope: string,
    conditions: Condition[][],
    configuration: Configuration | ConfigurationGroup
}

export interface Converter {
    convert(extension: ExtensionData): string | false;
}