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
            useMinify: false,
            notes: 'A test note'
        },
        {
            name: 'Kilkaya build k5aMeta',
            id: 624,
            file: './extensions/kilkaya/k5a_meta_populate.js',
            scope: Scope.AfterLoadRules,
            occurrence: Occurrence.RunAlways,
            status: Status.Active,
            useMinify: false
        },
        {
            name: 'go.welt.de - cfg flag',
            id: 548,
            file: './extensions/welt/tealium-go-welt-view.js',
            scope: Scope.PreLoader,
            occurrence: Occurrence.RunOnce,
            status: Status.Active,
            useMinify: false
        },
        {
            name: 'Merge utag.data, set env',
            id: 146,
            file: './extensions/welt/before_load_rules_data_merge.js',
            scope: Scope.BeforeLoadRules,
            occurrence: Occurrence.RunAlways,
            status: Status.Active,
            useMinify: false
        },
        {
            name: 'Peter ID',
            id: 533,
            file: './extensions/welt/peter_id_localstorage.js',
            scope: Scope.BeforeLoadRules,
            occurrence: Occurrence.RunOnce,
            status: Status.Active,
            useMinify: false
        },
        {
            name: 'Tracking-ready Event (kr3m, sportdaten.welt.de)',
            id: 433,
            file: './extensions/welt/peter_id_localstorage.js',
            scope: Scope.BeforeLoadRules,
            occurrence: Occurrence.RunAlways,
            status: Status.Active,
            useMinify: false
        },
        {
            name: 'Random ID für Welt Home Curation global_event_id',
            id: 401,
            file: './extensions/welt/random_id.js',
            scope: Scope.BeforeLoadRules,
            occurrence: Occurrence.RunOnce,
            status: Status.Active,
            useMinify: false
        },
        {
            name: 'Exclude Bot Traffic',
            id: 517,
            file: './extensions/welt/bot_traffic_detection.js',
            scope: Scope.BeforeLoadRules,
            occurrence: Occurrence.RunOnce,
            status: Status.Active,
            useMinify: false
        },
        {
            name: 'Send Peter ID to Kameleoon',
            id: 534,
            file: './extensions/welt/kameleoon_peter_id.js',
            scope: Scope.BeforeLoadRules,
            occurrence: Occurrence.RunAlways,
            status: Status.Active,
            useMinify: false
        },
        {
            name: 'Adobe: regwall events',
            id: 592,
            file: './extensions/welt/regwall_action_tracking.js',
            scope: Scope.BeforeLoadRules,
            occurrence: Occurrence.RunAlways,
            status: Status.Active,
            useMinify: false
        },
        {
            name: 'Spiele iFrame Interaction',
            id: 450,
            file: './extensions/welt/dutyfarm_iframe_tracking.js',
            scope: Scope.AfterLoadRules,
            occurrence: Occurrence.RunOnce,
            status: Status.Active,
            useMinify: false
        },
        {
            name: 'Lesen sie auch - utag.link to utag_main cookie',
            id: 512,
            file: './extensions/welt/lsa_tracking.js',
            scope: Scope.AfterLoadRules,
            occurrence: Occurrence.RunAlways,
            status: Status.Active,
            useMinify: false
        },
        {
            name: 'Google Sandbox',
            id: 546,
            file: './extensions/welt/cookie_deprecation_label.js',
            scope: Scope.AfterLoadRules,
            occurrence: Occurrence.RunAlways,
            status: Status.Active,
            useMinify: false
        },
        {
            name: 'Article SiteStay tracking with session expiry',
            id: 620,
            file: './extensions/welt/sitestay_tracking.js',
            scope: Scope.AfterLoadRules,
            occurrence: Occurrence.RunOnce,
            status: Status.Active,
            useMinify: false
        },
        {
            name: 'Media: type of revolverload for video events',
            id: 598,
            file: './extensions/welt/revolver_type_tracking.js',
            scope: Scope.AfterLoadRules,
            occurrence: Occurrence.RunAlways,
            status: Status.Active,
            useMinify: false
        },
        {
            name: 'Video Events : remove event_label from some video events',
            id: 523,
            file: './extensions/welt/video_event_label_cleanup.js',
            scope: '210',
            occurrence: Occurrence.RunAlways,
            status: Status.Active,
            useMinify: false,
        }
    ]
};
