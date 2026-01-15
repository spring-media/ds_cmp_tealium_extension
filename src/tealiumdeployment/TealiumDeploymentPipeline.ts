import { config } from '../config';
import { Extension } from './Extension';
import { TealiumAPI, TealiumProfilePayload } from './TealiumAPI';

export interface DeploymentPipelineConfig {
    profile: string;
    extensionsPath?: string;
}

export class TealiumDeploymentPipeline {
    private readonly account: string;
    private readonly profile: string;
    private readonly extensionsPath: string;
    private tealium: TealiumAPI | null;
    private currentProfile: TealiumProfilePayload | null;

    constructor(deploymentConfig: DeploymentPipelineConfig) {
        if (!['test-solutions2'].includes(deploymentConfig.profile)) {
            throw new Error(`Unknown Profile ${deploymentConfig.profile}`);
        }

        this.account = config.tealium.account;
        this.profile = deploymentConfig.profile;
        this.extensionsPath = deploymentConfig.extensionsPath || './extensions';
        this.tealium = null;
        this.currentProfile = null;
    }

    async connect(): Promise<void> {
        const username = config.tealium.user;
        const apiKey = config.tealium.apiKey;

        this.tealium = new TealiumAPI(username, apiKey);

        try {
            await this.tealium.connect(this.account, this.profile);
        } catch (error) {
            if (error instanceof Error && error.message.includes('Unauthorized')) {
                throw new Error('Login failed');
            }
            throw error;
        }
    }

    async fetchProfile(): Promise<TealiumProfilePayload> {
        if (!this.tealium) {
            throw new Error('Not connected');
        }
        const profile: TealiumProfilePayload | undefined = await this.tealium.getProfile();
        if (!profile || profile.account !== this.account || profile.profile !== this.profile) {
            throw new Error('Failed loading Profile');
        }
        this.currentProfile = profile;
        return profile;
    }

    getRemoteExtensions(): Extension[] {
        if (!this.currentProfile) {
            throw new Error('Profile not loaded. Run fetchProfile first.');
        }
        return this.currentProfile.extensions?.map(Extension.fromRemote) || [];
    }

    extensionCheck(): boolean {
        return false;
    }

    async deployExtensions(extensions: Extension[], deploymentMessage: string) {
        if (!this.tealium) {
            throw new Error('Not connected');
        }

        // Create deployment messages
        const deploymentDate = new Date();
        for (const ext of extensions) {

            const deploymentNode =
            '⚠️ DEPLOYED BY GITHUB-CI/CD - DO NOT CHANGE MANUALY ⚠️\n' +
            `Commit: ${deploymentMessage}\n` +
            `Src: ${ext.getFilepath()}\n` +
            `Deployed at:${deploymentDate.toUTCString()}`;

            ext.setNotes(deploymentNode);
        }

        for (const ext of extensions) {
            if (!ext.id) {
                throw new Error('Extension has no id');
            }
            const patchPayload = this.tealium.buildUpdatePayload(ext.id, {
                name: ext.name,
                code: ext.code,
                deploymentNotes: 'Just a test',
                extensionNotes: ext.getNotes(),
                occurrence: ext.getOccurrence(),
                status: ext.getStatus()
            });

            const response = await this.tealium.deploy(patchPayload);
            console.log(`Extension ${ext.name} deployed`, response);
        }

    }
}
