import axios from 'axios';

// Enums
export enum TealiumExtensionScope {
    AfterLoadRules = 'After Load Rules',
    BeforeLoadRules = 'Before Load Rules',
    DOMReady = 'DOM Ready'
}

export class TealiumAPI {

    private readonly apiKey: string;
    private readonly username: string;
    private token: string | null;
    private host: string | null;
    private account: string | null;
    private profile: string | null;

    constructor(username: string, apiKey: string) {
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
            throw new Error('TealiumAPI not connected.A');
        }

        try {
            const url = `https://${this.host}/v3/tiq/accounts/${this.account}/profiles/${this.profile}??includes=loadRules&includes=extensions&includes=tags&includes=tags.template&includes=variables&includes=events&includes=versionIds`;
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
            console.log(error);
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
                        scope: params.scope || TealiumExtensionScope.AfterLoadRules,
                        occurence: 'Run Always',
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

    public buildUpdatePayload(id: number, params: ExtensionUpdateParams): TealiumDeployPayload {
        return {
            versionTitle: params.versionTitle || `Update ${new Date().toISOString()}`,
            saveType: 'saveAs',
            notes: params.deploymentNotes,
            operationList: [
                {
                    op: 'replace',
                    path: `/extensions/${id}`,
                    value: {
                        object: 'extension',
                        name: params.name,
                        notes: params.extensionNotes || '',
                        type: 'Javascript Code',
                        scope: params.scope || TealiumExtensionScope.AfterLoadRules,
                        occurence: 'Run Always',
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
}

// TypeScript Interfaces
export interface ExtensionCreateParams {
    name: string;
    code: string;
    extensionNotes?: string;
    deploymentNotes: string;
    versionTitle?: string;
    scope?: TealiumExtensionScope;
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
    scope?: TealiumExtensionScope;
    targets?: {
        dev?: boolean;
        qa?: boolean;
        prod?: boolean;
    };
}

export interface TealiumExtension {
    id: number;
    extensionId: string;
    extenstionType: string;
    name: string;
    notes: string;
    scope: string;
    configuration: {
        code: string
    };
}

export interface TealiumProfilePayload {
    account: string;
    profile: string;
    extensions: TealiumExtension[] | null
}

export interface TealiumDeployPayload {
    versionTitle: string;
    saveType: 'saveAs' | 'save';
    notes: string;
    operationList: Array<{
        op: 'add' | 'replace' | 'remove';
        path: string;
        value?: any;
    }>;
}
