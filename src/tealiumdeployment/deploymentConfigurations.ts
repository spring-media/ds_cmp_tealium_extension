import { Occurrence, Scope, Status } from './TealiumAPI';
import { DeploymentConfiguration } from './TealiumDeploymentPipeline';

export const WeltDeploymentConfig: DeploymentConfiguration = {
    profile: 'welt',
    extensions: [
        {
            name: 'Kilkaya init k5aMeta',
            id: 623,
            file: './extensions/kilkaya/k5a_meta_init.js',
            scope: Scope.PreLoader, occurrence: Occurrence.RunOnce,
            status: Status.Active,
            useMinify: false
        },
        {
            name: 'Kilkaya build k5aMeta',
            id: 624,
            file: './extensions/kilkaya/k5a_meta_populate.js',
            scope: Scope.AfterLoadRules,
            occurrence: Occurrence.RunAlways,
            status: Status.Active,
            useMinify: false
        }
    ]
};
