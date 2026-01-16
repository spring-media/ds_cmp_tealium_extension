import { DeploymentConfiguration, TealiumDeploymentPipeline } from './TealiumDeploymentPipeline';

export const deployment = async (
    profile: string,
    deploymentConfiguration: DeploymentConfiguration,
    deploymentMessage: string
): Promise<void> => {

    const pipelineConfig = {
        profile
    };

    // 1. Try to connect
    const pipeline = new TealiumDeploymentPipeline(pipelineConfig);
    console.log('Connecting to Tealium API');
    await pipeline.connect();
    console.log('Connected to Tealium API');

    // 2. Load profile
    await pipeline.fetchProfile();

    // 3. Read all extensions
    await pipeline.readLocalExtensions(deploymentConfiguration);

    // 4. Can I find all extensions and are remote extensions ok?
    const extensToUpdate = pipeline.reconceil();
    if (extensToUpdate.length === 0) {
        console.log('Everything up to date');
        return;
    }

    // 4. Compare extensions -> determine update or create
    await pipeline.deployExtensions(extensToUpdate, deploymentMessage);

};
