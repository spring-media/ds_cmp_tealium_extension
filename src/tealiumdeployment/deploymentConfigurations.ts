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
            file: './extensions/welt/tracking_ready_sportdaten.js',
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
        },
        {
            name: 'Static.up.welt.de – Force Tealium Page View',
            id: 370,
            file: './extensions/welt/tealium-static-up-welt-view.js',
            scope: Scope.PreLoader,
            occurrence: Occurrence.RunOnce,
            status: Status.Active,
            useMinify: false,
            notes: 'Forces Tealium page view tracking on static.up.welt.de standalone pages used in apps and embedded widgets. Required for podcast player, Wordle, chess puzzle, elections, etc.'
        },
        {
            name: 'WHOAMI no lib and github',
            id: 563,
            file: './extensions/whoami.js',
            scope: Scope.BeforeLoadRules,
            occurrence: Occurrence.RunAlways,
            status: Status.Active,
            useMinify: false,
            notes: 'Reads the `asinfo` cookie to determine user authentication status and subscription entitlements for WELT and BILD properties. It populates Tealium data layer variables with user login state, subscription types (Plus/PUR), and user identifiers.'
        },
        {
            name: 'CMP_CustomVendorMapping',
            id: 365,
            file: './extensions/cmp/cmp_custom_vendor_mapping.js',
            scope: Scope.BeforeLoadRules,
            occurrence: Occurrence.RunAlways,
            status: Status.Active,
            useMinify: false,
        },
        {
            name: 'CMP Interaction Tracking',
            id: 366,
            file: './extensions/cmp/cmp_interaction_tracking.js',
            scope: Scope.BeforeLoadRules,
            occurrence: Occurrence.RunOnce,
            status: Status.Active,
            useMinify: false,
        },
        {
            name: 'CMP Interaction Tracking',
            id: 366,
            file: './extensions/welt/media_tracking.js',
            scope: Scope.BeforeLoadRules,
            occurrence: Occurrence.RunOnce,
            status: Status.Active,
            useMinify: false,
            notes: 'Tracking of CMP Interactions, fire page view and events'
        },
        {
            name: 'Media Tracking',
            id: 616,
            file: './extensions/welt/media_tracking.js',
            scope: Scope.BeforeLoadRules,
            occurrence: Occurrence.RunAlways,
            status: Status.Active,
            useMinify: false,
        },
        {
            name: 'TEALIUM ENVIRONMENT SWITCHER - ast.welt.de',
            id: 426,
            file: './extensions/welt/tealium_environment_switcher_welt.js',
            scope: Scope.AfterLoadRules,
            occurrence: Occurrence.RunAlways,
            status: Status.Active,
            useMinify: false,
            notes: 'A generic implementation of the Tealium Profile/Environment Switching Extension.'
        },
        {
            name: 'Adobe: CW berechnen',
            id: 318,
            file: './extensions/my_CW.js',
            scope: Scope.AfterLoadRules,
            occurrence: Occurrence.RunAlways,
            status: Status.Active,
            useMinify: false,
            notes: 'Related to Adobe, was created to cover lack of dimensions in Adobe'
        },
        {
            name: 'Adobe: Inline Element zu Home Teaser',
            id: 380,
            file: './extensions/welt/adobe_inline_element_home_teaser.js',
            scope: Scope.AfterLoadRules,
            occurrence: Occurrence.RunAlways,
            status: Status.Active,
            useMinify: false,
        },
        {
            name: 'Article Scrolldepth Brandstory',
            id: 560,
            file: './extensions/welt/brandstory/brandstory_scrolldepth.js',
            scope: Scope.AfterLoadRules,
            occurrence: Occurrence.RunOnce,
            status: Status.Active,
            useMinify: false,
        },
        {
            name: 'Article Milestones Brandstory',
            id: 561,
            file: './extensions/welt/brandstory/brandstory_milestones.js',
            scope: Scope.AfterLoadRules,
            occurrence: Occurrence.RunAlways,
            status: Status.Active,
            useMinify: false,
            notes: 'Page duration can be counted (page duration is improved with this extension)'
        },
        {
            name: 'webview : global nmtAppInfo setup',
            id: 590,
            file: './extensions/nmt_app_info.js',
            scope: Scope.AfterLoadRules,
            occurrence: Occurrence.RunAlways,
            status: Status.Active,
            useMinify: false,
        },
        {
            name: 'Braze: checkout',
            id: 617,
            file: './extensions/welt/braze_checkout_tracking.js',
            scope: Scope.AfterLoadRules,
            occurrence: Occurrence.RunAlways,
            status: Status.Active,
            useMinify: false,
            notes: 'Braze Library is loaded via REDO Problem was that when a page loads library twice, braze start a new sessions. There was no way in braze to stop that or check it before'
        },
        {
            name: 'RASP: helpers',
            id: 621,
            file: './extensions/welt/rasp/rasp_helpers.js',
            scope: Scope.AfterLoadRules,
            occurrence: Occurrence.RunAlways,
            status: Status.Active,
            useMinify: false,
        },
        {
            name: 'RASP: page view',
            id: 622,
            file: './extensions/welt/rasp/rasp.js',
            scope: Scope.AfterTagExtensions,
            occurrence: Occurrence.RunOnce,
            status: Status.Active,
            useMinify: false,
        },
        {
            name: 'ADOBE: doPlugins global',
            id: 436,
            file: './extensions/doPlugins/doPlugins_global.js',
            scope: '218, 210, 206, 155',
            occurrence: Occurrence.RunAlways,
            status: Status.Active,
            useMinify: false,
        },
        {
            name: 'ADOBE: doPlugins',
            id: 297,
            file: './extensions/welt/doPlugins_welt_liveticker.js',
            scope: '218, 210, 206, 155',
            occurrence: Occurrence.RunAlways,
            status: Status.Active,
            useMinify: false,
        }
    ]
};
