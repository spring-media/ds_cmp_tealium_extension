/* global utag, RaspHelpers */

/**
 * Rasp Tracking Integration
 *
 * This extension initializes Rasp (Ringier Axel Springer) tracking for WELT.de
 * It sets up the ringDataLayer with custom data and loads the Simetra tracking script
 * when user has consented to Rasp vendor.
 *
 * Dependencies: rasp_helpers.js (must load before this extension)
 * Scope: After Load Rules / Extensions
 */

(function() {
    try {
        // Get all tracking data from helpers (teaser + campaign + ICID)
        const trackingData =
            typeof RaspHelpers !== 'undefined'
                ? RaspHelpers.getAllTrackingData()
                : {
                    trackingValue: '',
                    blockValue: '',
                    pageId: '',
                    teaserPositionPage: '',
                    cid: '',
                    icid: '',
                    pageReloadstatus: '',
                    adLibBranch: ''
                };

        const tiqVersion = utag.cfg.utid.split('/').slice(1).join('/');
        const customDataLayer = {
            appName: 'WELT.de',
            pagePlatform: utag.data.page_platform,
            isSubscriber: utag.data.user_hasPlusSubscription2,
            ch_events: utag.data.sp_events || '', // eVar44
            mkt_channel: utag.data.mkt_channel || '',
            mkt_channel_category: utag.data.mkt_channel_category || '',
            tiqVersion: tiqVersion,
            tiqEnv: utag.data['ut.env'] || '',
            timezoneOffset: new Date().getTimezoneOffset() / -60,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            appOs: utag.data.app_os || '',
            appVersion: utag.data.app_version || '',
            previousPage: utag.data.previous_page_name || '',
            pageReloadStatus: trackingData.pageReloadstatus,
            adLibBranch: trackingData.adLibBranch,
            teaserPosition: trackingData.trackingValue,
            teaserPositionPage: trackingData.teaserPositionPage,
            teaserBlock: trackingData.blockValue,
            pageId: trackingData.pageId,
            cid: trackingData.cid,
            icid: trackingData.icid,
            outbrainModel: utag.data.page_outbrain_model || '',
            isLoggedIn: utag.data.user_isLoggedIn2 || '',
            pageContainsVideo: utag.data.page_has_video || '',
            cmpFirstPageview: utag.data.cmp_event_status === 'cmpuishown' ? 'cmp_first_pv' : '',
            ac1: utag.data['cp.utag_main_ac'] || '' // eVar241
        };

        window.ringDataLayer = {
            // the only place where the 'ringDataLayer' is set, so there is no need to use 'Object.assign' and there is no risk of race conditions!
            edl: customDataLayer,
            context: {
                tracking: {
                    autostart: false
                },
                publication_structure: {
                    root: 'welt',
                    path: window.location.pathname.split('/').slice(1, -1).join('/')
                }
            },
            content: {
                type: utag.data.page_type || 'no pageType',
                publication: {
                    premium: utag.data.page_isPremium?.toLowerCase() === 'true'
                },
                source: {
                    system: 'BFF',
                    id: utag.data.page_escenicId || 'no pageId'
                }
            },
            user: {
                sso: {
                    logged: { id: utag.data.user_jaId2 || '' }
                },
                id: {
                    external: {
                        id: { peterId: utag.data.peterId || '' }
                    }
                }
            }
        };

        // runs with click at "alle akzeptieren"
        if (/(^|;)\s*cmp_cv_list\s*=\s*[^;]*rasp[^;]*(;|$)/.test(document.cookie)) {
            window.dlApi = window.dlApi != null ? window.dlApi : {};
            window.dlApi.kropka = window.dlApi.kropka != null ? window.dlApi.kropka : {};
            window.dlApi.kropka.DX = 'PV_4,welt_de,' + utag.data.page_escenicId + ',1';

            const script = document.createElement('script');
            script.src =
                'https://simetra.tracking.ringieraxelspringer.tech/EA-3734738/simetra.boot.js?domain=welt.de';
            script.async = true;
            document.head.appendChild(script);

            window.addEventListener('simetra-load', () =>
                window.__tcfapi('addEventListener', 2, (tcData, success) => {
                    if (success) {
                        setTimeout(() => {
                            // if next if is activated it loads js already before consent but it sets (acc_segment* cookie which are not allowed)
                            window.EventsApi.start();
                        }, 1000);
                    }
                })
            );
        }
    } catch (e) {
        console.error('[TEALIUM RASP] Error initializing Rasp tracking:', e);
    }
})();
