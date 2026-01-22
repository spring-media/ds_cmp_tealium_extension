import { Logger } from 'winston';
import { DeploymentConfiguration, TealiumDeploymentPipeline } from './TealiumDeploymentPipeline';

export const deployment = async(
    profile: string,
    deploymentConfiguration: DeploymentConfiguration,
    deploymentMessage: string,
    logger: Logger
): Promise<void> => {

    const pipelineConfig = {
        profile
    };

    // 1. Try to connect
    const pipeline = new TealiumDeploymentPipeline(pipelineConfig, logger);
    logger.info('Connecting to Tealium API');
    await pipeline.connect();
    logger.info('Connected to Tealium API');

    // 2. Load profile
    await pipeline.fetchProfile();

    // 3. Read all extensions
    await pipeline.readLocalExtensions(deploymentConfiguration);

    // 4. Can I find all extensions and are remote extensions ok?
    const extensionsToUpdate = pipeline.reconcile();
    if (extensionsToUpdate.length === 0) {
        logger.info('Everything up to date');
        return;
    }

    // 4. Compare extensions -> determine update or create
    await pipeline.deployExtensions(extensionsToUpdate, deploymentMessage);

};
