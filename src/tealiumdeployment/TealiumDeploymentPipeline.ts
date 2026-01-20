import * as fs from 'fs';
import { minify } from 'terser';
import { config } from '../config';
import { Extension } from './Extension';
import { ExtensionType, Occurrence, Scope, Status, TealiumAPI, TealiumProfilePayload } from './TealiumAPI';
import { TealiumExtensionDiff } from './TealiumExtensionDiff';
import { Logger } from 'winston';

export interface DeploymentPipelineConfig {
    profile: string;
    extensionsPath?: string;
}

export type DeploymentConfiguration = {
    profile: string,
    extensions: {
        name: string,
        id: number,
        file: string,
        scope: Scope,
        occurrence: Occurrence,
        status: Status,
        useMinify?: boolean
     }[]
}

export class TealiumDeploymentPipeline {
    private readonly account: string;
    private readonly profile: string;
    private readonly extensionsPath: string;
    private tealium: TealiumAPI | null;
    private currentProfile: TealiumProfilePayload | null;
    private localExtensions: Extension[];
    private logger: Logger;

    constructor(deploymentConfig: DeploymentPipelineConfig, logger: Logger) {
        if (!['welt', 'test-solutions2'].includes(deploymentConfig.profile)) {
            throw new Error(`Unknown Profile ${deploymentConfig.profile}`);
        }

        this.logger = logger;

        this.account = config.tealium.account;
        this.profile = deploymentConfig.profile;
        this.extensionsPath = deploymentConfig.extensionsPath || './extensions';
        this.tealium = null;
        this.currentProfile = null;
        this.localExtensions = [];
    }

    async connect(): Promise<void> {
        const username = config.tealium.user;
        const apiKey = config.tealium.apiKey;

        this.tealium = new TealiumAPI(username, apiKey, this.logger);

        try {
            await this.tealium.connect(this.account, this.profile);
        } catch (error) {
            if (error instanceof Error && error.message.includes('Unauthorized')) {
                throw new Error('Tealium login failed');
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

        return this.currentProfile.extensions?.map((extension) => {
            if (!ExtensionType.includes(extension.extensionType)) {
                this.logger.info(`Remote: ExtensionType ${extension.extensionType} not supported. ignored.`);
                return null;
            }

            if (!Scope.includes(extension.scope)) {
                this.logger.info(`Remote: Scope ${extension.scope} not supported. ignored.`);
                return null;
            }

            return Extension.fromRemote(extension);
        }).filter(extension => extension != null) || [];
    }

    private readFile(path: string): string {
        try {
            const jsCode = fs.readFileSync(path, 'utf-8');
            return jsCode;
        } catch (error: any) {
            this.logger.error(error.message);
            throw Error(`Read File failed. ${path}: ${error.message}`);
        }
    }

    private async readCode(filepath: string, useMinify?: boolean): Promise<string> {
        const code = this.readFile(filepath);
        if (useMinify !== true) {
            return code;
        }
        const minifyResult = await minify(code, {
            compress: true,
            mangle: false
        });

        if (!minifyResult.code) {
            throw new Error(`Minify failed ${filepath}. Fallback to original.`);
        }
        return minifyResult.code;
    }

    async readLocalExtensions(deploymentConfiguration: DeploymentConfiguration) {
        let filesNotFound = 0;
        for (const extensionConfig of deploymentConfiguration.extensions) {
            try {
                const code = await this.readCode(extensionConfig.file, extensionConfig.useMinify);
                const extension = Extension.fromLocal(extensionConfig.id, extensionConfig.name, code);
                extension.setScope(Scope.fromString(extensionConfig.scope));
                extension.setOccurrence(Occurrence.fromString(extensionConfig.occurrence));
                extension.setStatus(Status.fromString(extensionConfig.status));
                extension.setFilePath(extensionConfig.file);
                this.localExtensions.push(extension);
            } catch (error: any) {
                this.logger.error(error);
                filesNotFound += 1;
            }
        }

        if (filesNotFound > 0) {
            throw new Error('Not all extensions found');
        }
        return [...this.localExtensions];
    }

    reconcile(): Extension[] {
        const diff = new TealiumExtensionDiff(this.logger);
        diff.setLocalExtensions(this.localExtensions);
        diff.setRemoteExtensions(this.getRemoteExtensions());
        diff.diff();

        const extensionsForUpdate = diff.getExtensionsToUpdate();
        const extensionsNotFound = diff.getExtensionsNotFound();

        if (extensionsForUpdate.length > 0) {
            for (const extension of extensionsForUpdate) {
                this.logger.info(`Extension '${extension.name}' (${extension.id}) will be updated. ${extension.getHash()}`);
            }
        }

        if (extensionsNotFound.length > 0) {
            for (const extension of extensionsNotFound) {
                this.logger.info(`Remote extension ${extension.name} (${extension.id}) not found.`);
            }
            throw new Error('Not all extensions found in Tealium.');
        }

        return extensionsForUpdate;
    }

    async deployExtensions(extensions: Extension[], deploymentMessage: string) {
        if (!this.tealium) {
            throw new Error('Not connected');
        }

        // Create deployment messages
        const operations = [];
        const deploymentDate = new Date();
        for (const ext of extensions) {
            if (!ext.id) {
                throw new Error('Extension has no id');
            }

            const hash = ext.getHash();
            const deploymentNode =
            '⚠️ DEPLOYED BY GITHUB-CI/CD - DO NOT CHANGE MANUALLY ⚠️\n' +
            `Commit: ${deploymentMessage}\n` +
            `Src: ${ext.getFilepath()}\n` +
            `Deployed at:${deploymentDate.toUTCString()}\n` +
            `Hash: ${hash}`;
            ext.setNotes(deploymentNode);
            this.logger.info(`Adding to deployment ${ext.name} - ${hash}`);

            const operation = this.tealium.buildOperationPayload(ext.id, {
                name: ext.name,
                code: ext.code,
                scope: ext.getScope(),
                deploymentNotes: `GITHUB/CICD ${deploymentMessage}`,
                extensionNotes: ext.getNotes(),
                occurrence: ext.getOccurrence(),
                status: ext.getStatus()
            });

            operations.push(operation);
        }

        const patchPayload = this.tealium.buildUpdatePayload(operations, `GITHUB/CICD ${deploymentMessage}`);
        this.logger.info(`Deploying to ${this.profile} - ${new Date().toUTCString()}`);
        const response = await this.tealium.deploy(patchPayload);
        this.logger.info(`Extensions deployed - ${new Date().toUTCString()}`, response);
    }
}
