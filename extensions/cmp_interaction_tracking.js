(function () {

    const CONSENT_MESSAGE_EVENTS = {
        11: 'cm_accept_all',
        12: 'cm_show_privacy_manager',
        13: 'cm_reject_all',
    };
    const PRIVACY_MANAGER_EVENTS = {
        SAVE_AND_EXIT: 'pm_save_and_exit',
        ACCEPT_ALL: 'pm_accept_all',
    };
    const TCFAPI_COMMON_EVENTS = {
        CMP_UI_SHOWN: 'cm_layer_shown',
    };

    // Tealium profile to Adobe TagId mapping.
    const TEALIUM_PROFILES = {
        'abo-autobild.de': 23,
        'ac-autobild': 10,
        'ac-computerbild': 9,
        'ac-wieistmeineip': 4,
        'asmb-metal-hammer.de': 22,
        'asmb-musikexpress.de': 14,
        'asmb-rollingstone.de': 16,
        'bild-bild.de': 12,
        'bild-fitbook.de': 40,
        'bild-myhomebook.de': 37,
        'bild-petbook.de': 82,
        'bild-sportbild.de': 16,
        'bild-stylebook.de': 30,
        'bild-techbook.de': 82,
        'bild-travelbook.de': 42,
        'bild-offer': 24,
        'bild': 386,
        'bz-bz-berlin.de': 9,
        'cbo-computerbild.de': 25,
        'shop.bild': 181,
        'spring-premium' : 135,
        'welt': 233,
        'welt-shop.welt.de': 28
    };

    let cmp_ab_id = '';
    let cmp_ab_desc = '';
    let cmp_ab_bucket = '';

    // Create a centralized reference to all members of this unit which needs be exposed for unit testing.
    const exportedFunctions = {
        init,
        run,
        configSourcepoint,
        getAdobeTagId,
        registerEventHandler,
        onMessageReceiveData,
        onMessageChoiceSelect,
        onPrivacyManagerAction,
        onCmpuishown,
        initABTestingProperties,
        sendLinkEvent,
        onMessage,
        setABTestingProperties,
        getABTestingProperties,
        onUserConsent,
        sendFirstPageViewEvent,
        hasUserDeclinedConsent,
        isAfterCMP
    };

    function getABTestingProperties() {
        if (cmp_ab_id || cmp_ab_desc || cmp_ab_bucket) {
            return cmp_ab_id + ' '
                + cmp_ab_desc + ' '
                + cmp_ab_bucket;
        } else {
            return null;
        }

    }

    function setABTestingProperties(data) {
        if (data) {
            cmp_ab_desc = data.msgDescription;
            cmp_ab_id = data.messageId;
            cmp_ab_bucket = data.bucket;
        }
    }

    // Alternative way of setting AB-Testing properties through global variable.
    function initABTestingProperties() {
        if (window.__cmp_interaction_data && window.__cmp_interaction_data.onMessageReceiveData) {
            exportedFunctions.setABTestingProperties(window.__cmp_interaction_data.onMessageReceiveData);
        }
    }

    function onMessageReceiveData(data) {
        exportedFunctions.setABTestingProperties(data);
    }

    function isAfterCMP() {
        const hasCMPAfterCookie = window.utag.data['cp.utag_main_cmp_after'] ? (window.utag.data['cp.utag_main_cmp_after'] === 'true') : false;
        const defaultVendorList = 'adobe_cmp,';
        const hasVendors = !!window.utag.data.consentedVendors && window.utag.data.consentedVendors !== defaultVendorList;

        // sportbild.bild.de needs special treatment because of sub-domain issues.
        if (window.utag.data['ut.profile'] === 'bild-sportbild.de') {
            // hasCMPAfterCookie cannot be used here because it shares cookie with base domain bild.de
            return hasVendors;
        } else {
            return hasCMPAfterCookie || hasVendors;
        }
    }

    function hasUserDeclinedConsent() {
        const hasUserGivenConsent = window.utag.data.consentedVendors && window.utag.data.consentedVendors.includes('adobe_analytics');
        const isAfterCMP = exportedFunctions.isAfterCMP();

        return hasUserGivenConsent ? false : isAfterCMP;
    }

    function sendLinkEvent(label) {
        if (!exportedFunctions.hasUserDeclinedConsent()) {
            window.utag.link({
                'event_name': 'cmp_interactions',
                'event_action': 'click',
                'event_label': label,
                'event_data': getABTestingProperties()
            });
        }
    }

    function onUserConsent() {
        if (window.cmp && window.cmp._scrollDepthObj) {
            // Calling setScrollDepthProperties() will make the current page trackable as the _ppvPreviousPage of the next page view.
            window.cmp._scrollDepthObj.setScrollDepthProperties(window.cmp);
        }
        window.cmp._campaignObj.setCampaignVariables(window.cmp, true);
    }

    function sendFirstPageViewEvent() {
        // Check if user has already given/declined consent
        if (!exportedFunctions.isAfterCMP()) {
            const adobeTagId = exportedFunctions.getAdobeTagId(window.utag.data['ut.profile']);
            window.utag.view(window.utag.data, null, [adobeTagId]);
        }
    }

    function onMessageChoiceSelect(id, eventType) {
        if (CONSENT_MESSAGE_EVENTS[eventType]) {
            window.utag.data['cmp_events'] = CONSENT_MESSAGE_EVENTS[eventType];
            exportedFunctions.sendLinkEvent(CONSENT_MESSAGE_EVENTS[eventType]);

            if (eventType === 11 || eventType === 13) {
                window.utag.loader.SC('utag_main', {'cmp_after': 'true'});
                window.utag.data['cp.utag_main_cmp_after'] = 'true';
            }

            if (eventType === 11) {
                exportedFunctions.onUserConsent();
            }
        }
    }

    function onPrivacyManagerAction(eventType) {
        if (PRIVACY_MANAGER_EVENTS[eventType] || eventType.purposeConsent) {
            window.utag.data['cmp_events'] = eventType.purposeConsent ? (eventType.purposeConsent === 'all' ? PRIVACY_MANAGER_EVENTS.ACCEPT_ALL : PRIVACY_MANAGER_EVENTS.SAVE_AND_EXIT) : PRIVACY_MANAGER_EVENTS[eventType];
            exportedFunctions.sendLinkEvent(window.utag.data['cmp_events']);
            // Set cookie for first page view tracking.
            window.utag.loader.SC('utag_main', {'cmp_after': 'true'});
            window.utag.data['cp.utag_main_cmp_after'] = 'true';
        }
    }

    function onCmpuishown(tcData) {
        if (tcData && tcData.eventStatus === 'cmpuishown') {
            window.utag.data.cmp_events = TCFAPI_COMMON_EVENTS.CMP_UI_SHOWN;
            exportedFunctions.sendFirstPageViewEvent();
            // Ensure that view event gets processed before link event by adding a delay.
            setTimeout(() => {
                exportedFunctions.sendLinkEvent(TCFAPI_COMMON_EVENTS.CMP_UI_SHOWN);
            }, 500);
        }
    }

    function onMessage(event) {
        if (event.data && event.data.cmpLayerMessage) {
            exportedFunctions.sendLinkEvent(event.data.payload);
        }
    }

    function getAdobeTagId(tealiumProfileName) {
        const adobeTagId = TEALIUM_PROFILES[tealiumProfileName];
        if (!adobeTagId) {
            throw new Error('Cannot find Adobe Tag ID for profile: ' + tealiumProfileName);
        }
        return adobeTagId;
    }

    function registerEventHandler() {
        window._sp_queue = window._sp_queue || [];
        window._sp_queue.push(() => {
            window._sp_.addEventListener('onMessageReceiveData', onMessageReceiveData);
        });
        window._sp_queue.push(() => {
            window._sp_.addEventListener('onMessageChoiceSelect', onMessageChoiceSelect);
        });
        window._sp_queue.push(() => {
            window._sp_.addEventListener('onPrivacyManagerAction', onPrivacyManagerAction);
        });
        window._sp_queue.push(() => {
            window.__tcfapi('addEventListener', 2, onCmpuishown);
        });
        window.addEventListener('message', onMessage, false);
    }

    function configSourcepoint() {
        window._sp_.config.events = window._sp_.config.events || {};
    }

    function run() {
        exportedFunctions.configSourcepoint();
        exportedFunctions.initABTestingProperties();
        exportedFunctions.registerEventHandler();
    }

    function init() {
        if (window._sp_ && window._sp_.config && !window.__utag_cmp_event_tracking) {
            exportedFunctions.run();
            window.__utag_cmp_event_tracking = true; // Protection against multiple executions.
        }
    }

    // Evaluate runtime environment (Browser or Node.js)
    if (typeof exports === 'object') {
        // Expose reference to members for unit testing.
        module.exports = exportedFunctions;
    } else {
        // Call entry point in browser context.
        init();
    }

})();
