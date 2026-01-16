import { DeploymentConfiguration, TealiumDeploymentPipeline } from './TealiumDeploymentPipeline';

export type DeploymentResponse = {
    succesful: boolean
    error?: string
}

export const deployment = async (
    profile: string,
    deploymentConfiguration: DeploymentConfiguration,
    deploymentMessage: string
): Promise<DeploymentResponse> => {

    const pipelineConfig = {
        profile
    };

    // 1. Try to connect
    const pipeline = new TealiumDeploymentPipeline(pipelineConfig);
    await pipeline.connect();

    // 2. Load profile
    const tealiumProfil = await pipeline.fetchProfile();
    // console.log(tealiumProfil);

    // 3. Read all extensions
    await pipeline.readLocalExtensions(deploymentConfiguration);

    // 4. Can I find all extensions and are remote extensions ok?
    const extensToUpdate = pipeline.reconceil();

    // 4. Compare extensions -> determine update or create

    await pipeline.deployExtensions(extensToUpdate, deploymentMessage);

    return { succesful: true };
};
