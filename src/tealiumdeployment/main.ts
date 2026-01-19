import { deployment } from './deployment';
import { Occurrence, Status, Scope } from './TealiumAPI';
import { DeploymentConfiguration } from './TealiumDeploymentPipeline';

(async () => {
    console.log('Start deployment to tealium');

    // Parse command line arguments
    const commitMessage = process.argv[2];

    if (!commitMessage) {
        console.error('Error: Commit message is required!');
        console.log('Usage: npm run deploy -- "Your commit message"');
        console.log('Example: npm run deploy -- "TICKET-123 - Update extensions"');
        process.exit(1);
    }

    const deploymentConfig: DeploymentConfiguration = {
        extensions: [
            { name: 'My extension 1', id: 7, file: './extensions/kilkaya/k5a_meta_init.js', scope: Scope.AfterLoadRules, occurrence: Occurrence.RunAlways, status: Status.Active },
            { name: 'My extension 2', id: 8, file: './extensions/kilkaya/k5a_meta_populate.js', scope: Scope.AfterLoadRules, occurrence: Occurrence.RunAlways, status: Status.Active }
        ]
    };

    try {
        await deployment('test-solutions2', deploymentConfig, commitMessage);
        console.log('Deployment finished');
    } catch (error: any) {
        console.error(error.message);
        console.log('Deployment aborted');
        process.exit(1);
    }
})();
