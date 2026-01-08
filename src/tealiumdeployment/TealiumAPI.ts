import axios from 'axios';

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
}
