import axios from 'axios';
import { Logger } from 'winston';

// Enums

export enum ExtensionType {
    JavascriptCode = 'Javascript Code',
    AdvancedJavascriptCode = 'Advanced Javascript Code'
}

export namespace ExtensionType {
    export function includes(value: string): value is ExtensionType {
        return Object.values(ExtensionType).includes(value as ExtensionType);
    }

    export function fromString(value: string): ExtensionType {
        if (includes(value)) return value;
        throw new Error(`'${value}' is not part of ExtensionType`);
    }
}

export enum Scope {
    PreLoader = 'Pre Loader',
    AfterLoadRules = 'After Load Rules',
    BeforeLoadRules = 'Before Load Rules',
    DOMReady = 'DOM Ready'
}

export namespace Scope {
    export function includes(value: string): value is Scope {
        return Object.values(Scope).includes(value as Scope);
    }

    export function fromString(value: string): Scope | string {
        if (includes(value)) return value;
        
        if (isTagScoped(value)) return value;
        
        throw new Error(`'${value}' is not a valid Scope. Use predefined scopes or numeric tag IDs (e.g., "210" or "233,155")`);
    }
    
    export function isTagScoped(value: string): boolean {
        return /^\d+(,\d+)*$/.test(value);
    }
    
    export function extractTagIds(scope: string): number[] {
        if (!isTagScoped(scope)) return [];
        return scope.split(',').map(id => parseInt(id, 10));
    }
}

export enum Occurrence {
    RunAlways = 'Run Always',
    RunOnce = 'Run Once'
}

export namespace Occurrence {
    export function includes(value: string): value is Occurrence {
        return Object.values(Occurrence).includes(value as Occurrence);
    }

    export function fromString(value: string): Occurrence {
        if (includes(value)) return value;
        throw new Error(`'${value}' is not part of Occurrence`);
    }
}

export enum Status {
    Active = 'active',
    Inactive = 'inactive'
}

export namespace Status {
    export function includes(value: string): value is Status {
        return Object.values(Status).includes(value as Status);
    }

    export function fromString(value: string): Status {
        if (includes(value)) return value;
        throw new Error(`'${value}' is not part of ExtensionType`);
    }
}

export class TealiumAPI {

    private readonly logger: Logger;
    private readonly apiKey: string;
    private readonly username: string;
    private token: string | null;
    private host: string | null;
    private account: string | null;
    private profile: string | null;


    constructor(username: string, apiKey: string, logger: Logger) {
        this.logger = logger;
        this.username = username;
        this.apiKey = apiKey;
        this.account = null;
        this.profile = null;
        this.token = null;
        this.host = null;
    }

    isConnected(): boolean {
        return this.token != null;
    }

    public getConnectionDetails() {
        return {
            host: this.host,
            account: this.account,
            profile: this.profile
        };
    }

    public async connect(account: string, profile: string): Promise<boolean> {

        const params = new URLSearchParams();
        params.append('username', this.username);
        params.append('key', this.apiKey);

        // use global host for auth
        const url = `https://platform.tealiumapis.com/v3/auth/accounts/${account}/profiles/${profile}`;
        try {
            const response = await axios.post(url, params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            if (response.status === 200) {
                this.profile = profile;
                this.account = account;
                this.token = response.data.token;
                this.host = response.data.host; // deployment might use regional host, defined by tealium
            }
            return response.status === 200;

        } catch (error: any) {
            throw new Error(`Auth failed. ${error.message}`);
        }
    }

    public async getProfile(): Promise<TealiumProfilePayload | undefined> {
        if (!this.isConnected()) {
            throw new Error('TealiumAPI not connected.');
        }

        try {
            const url = `https://${this.host}/v3/tiq/accounts/${this.account}/profiles/${this.profile}?includes=loadRules&includes=extensions&includes=tags&includes=tags.template&includes=variables&includes=events&includes=versionIds`;
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Accept': 'application/json'
                }
            });
            if (response.status === 200) {
                return response.data;
            }
        } catch (error: any) {
            this.logger.error(error);
            throw new Error(`GetProfile failed. ${error.message}`);
        }
    }

    public async deploy(payLoad: any): Promise<boolean> {
        if (!this.isConnected()) {
            throw new Error('TealiumAPI not connected.');
        }

        try {
            const url = `https://${this.host}/v3/tiq/accounts/${this.account}/profiles/${this.profile}`;
            const response = await axios.patch(url, payLoad, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.status === 200;
        } catch (error: any) {
            throw new Error(`Deploy failed. ${error.message}`);
        }
    }

    public buildCreatePayload(params: ExtensionCreateParams): TealiumDeployPayload {
        return {
            versionTitle: params.versionTitle || `Deploy ${new Date().toISOString()}`,
            saveType: 'saveAs',
            notes: params.deploymentNotes,
            operationList: [
                {
                    op: 'add',
                    path: '/extensions',
                    value: {
                        object: 'extension',
                        name: params.name,
                        notes: params.extensionNotes || '',
                        type: 'Javascript Code',
                        scope: params.scope || Scope.AfterLoadRules,
                        occurrence: 'Run Always',
                        status: 'active',
                        selectedTargets: params.targets || {
                            dev: true,
                            qa: true,
                            prod: true
                        },
                        conditions: [[]],
                        configuration: [
                            {
                                name: 'code',
                                value: params.code
                            }
                        ]
                    }
                }
            ]
        };
    }

    public buildUpdatePayload(operations: TealiumOperationPayload[], deploymentNotes: string): TealiumDeployPayload {
        return {
            versionTitle: `Update ${new Date().toISOString()}`,
            saveType: 'saveAs',
            notes: deploymentNotes,
            operationList: operations
        };
    }

    public buildOperationPayload(id: number, params: ExtensionUpdateParams): TealiumOperationPayload {
        const operation: TealiumOperationPayload = {
            op: 'replace',
            path: `/extensions/${id}`,
            value: {
                object: 'extension',
                name: '[A] ' + params.name,
                notes: params.extensionNotes || '',
                type: 'Javascript Code',
                scope: params.scope || Scope.AfterLoadRules,
                occurrence: params.occurrence,
                status: params.status,
                selectedTargets: params.targets || {
                    dev: true,
                    qa: true,
                    prod: true
                },
                conditions: [[]],
                configuration: [
                    {
                        name: 'code',
                        value: params.code
                    }
                ]
            }
        };

        if (params.scope === Scope.PreLoader) {
            delete (operation.value as any).occurrence;
            delete (operation.value as any).conditions;
        }

        return operation;
    }
}

// TypeScript Interfaces
export interface ExtensionCreateParams {
    name: string;
    code: string;
    extensionNotes?: string;
    deploymentNotes: string;
    versionTitle?: string;
    scope?: Scope | string; 
    targets?: {
        dev?: boolean;
        qa?: boolean;
        prod?: boolean;
    };
}

export interface ExtensionUpdateParams {
    name: string;
    code: string;
    extensionNotes?: string;
    deploymentNotes: string;
    versionTitle?: string;
    scope?: Scope | string; 
    occurrence: Occurrence;
    status: Status;
    targets?: {
        dev?: boolean;
        qa?: boolean;
        prod?: boolean;
    };
}

export interface TealiumExtension {
    id: number;
    extensionId: string;
    extensionType: string;
    name: string;
    notes: string;
    scope: string;
    occurrence: string;
    status: string;
    configuration: {
        code: string
    };
}

export interface TealiumTag {
    id: number;
    tagId: string;
    title: string;
    type: string;
    status: string;
}

export interface TealiumProfilePayload {
    account: string;
    profile: string;
    extensions: TealiumExtension[] | null;
    tags: TealiumTag[] | null;
}

export interface TealiumOperationPayload {
    op: 'add' | 'replace' | 'remove';
    path: string;
    value?: any;
}

export interface TealiumDeployPayload {
    versionTitle: string;
    saveType: 'saveAs' | 'save';
    notes: string;
    operationList: Array<TealiumOperationPayload>;
}
