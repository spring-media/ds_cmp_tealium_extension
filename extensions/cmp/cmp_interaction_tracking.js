(function () {

    const CONSENT_MESSAGE_EVENTS = {
        11: 'cm_accept_all',
        12: 'cm_show_privacy_manager',
        13: 'cm_reject_all',
        5: 'cm_subscribe_pur',
    };
    const PRIVACY_MANAGER_EVENTS = {
        1: 'pm_accept_as_selected',
        2: 'pm_back_to_cmp_layer',
        9: 'pm_subscribe_pur',
        11: 'pm_accept_all',
    };
    const TCFAPI_COMMON_EVENTS = {
        CMP_UI_SHOWN: 'cm_layer_shown',
    };

    // Tealium profile to Adobe TagId mapping.
    const TEALIUM_PROFILES = {
        'abo-autobild.de': 23,
        'ac-autobild': 1,
        'ac-computerbild': 3,
        'ac-wieistmeineip': 4,
        'asmb-metal-hammer.de': 22,
        'asmb-musikexpress.de': 14,
        'asmb-rollingstone.de': 16,
        'bild-bild.de': 5,
        'bild-fitbook.de': 30,
        'bild-myhomebook.de': 30,
        'bild-petbook.de': 78,
        'bild-stylebook.de': 19,
        'bild-techbook.de': 68,
        'bild-travelbook.de': 34,
        'bild-offer': 24,
        'bild': 386,
        'bz-bz-berlin.de': 6,
        'cbo-computerbild.de': 25,
        'shop.bild': 181,
        'spring-premium' : 135,
        'welt': 155,
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
        hasUserAlreadyConsentGranted,
        isAfterCMP,
        notPurUser
    };

    function getDomainNoConsent() {
        const domains = [
            'fitbook-magazine.com',
            'myhomebook-magazine.com',
            'petbook-magazine.com',
            'stylebook-magazine.com',
            'techbook-magazine.com',
            'travelbook-magazine.com',
            'shop.welt.de',
            'bildplusshop.bild.de',
        ];
        if ((window.utag.data['dom.domain']) && domains.indexOf(window.utag.data['dom.domain']) !== -1){
            return true
        } else {
            // Return nothing if domain doesn't match
            return null;
        }
    }

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

    // User can jump over different subdomains with different layers 
    // Cookie utag_main_cmp_after support to differ between them
    function isAfterCMP() {
        const hasCMPAfterCookie = window.utag.data['cp.utag_main_cmp_after'] ? (window.utag.data['cp.utag_main_cmp_after'] === 'true') : false;
        const hasCMPAfterCookie_subdomain = window.utag.data['cp.utag_main_cmp_after_sub'] ? (window.utag.data['cp.utag_main_cmp_after_sub'] === 'true') : false;
        const defaultVendorList = 'adobe_cmp,';
        const hasVendors = !!window.utag.data['cp.cmp_cv_list'] && window.utag.data['cp.cmp_cv_list'] !== defaultVendorList;
        const hasVendors_subdomain = !!window.utag.data['cp.cm_cv_list'] && window.utag.data['cp.cm_cv_list'] !== defaultVendorList;

        // sportbild.bild.de needs special treatment because of sub-domain issues.
        // subdomains sometimes use different layer
        const subdomains = [
            'sportbild.bild.de',
            'm.sportbild.bild.de',
            'shop.bild.de',
            'angebot.bild.de',
            'shopping.welt.de',
            'shop.welt.de',
            'bildplusshop.bild.de',
            'digital.welt.de'
        ];
        // sportbild.bild.de, shop.bild.de, offerpages needs special treatment because of sub-domain issues/different layers.
        if ((window.utag.data['dom.domain']) && subdomains.indexOf(window.utag.data['dom.domain']) !== -1){
            // hasCMPAfterCookie cannot be used here because it shares cookie with base domain
            return hasCMPAfterCookie_subdomain || hasVendors_subdomain;
        } else {
            return hasCMPAfterCookie || hasVendors;
        }
    }

    function hasUserAlreadyConsentGranted() {
        const consentedVendors = window.utag.data['cp.cmp_cv_list'] || window.utag.data['cp.cm_cv_list'] || '';
        const hasUserGivenConsent =  consentedVendors.includes('adobe_analytics');
        const isAfterCMP = exportedFunctions.isAfterCMP();

        return hasUserGivenConsent === false ? false : isAfterCMP;
    }

    function sendLinkEvent(label) {
        if (!exportedFunctions.hasUserAlreadyConsentGranted() && exportedFunctions.notPurUser()) {
            window.utag.link({
                'event_name': 'cmp_interactions',
                'event_action': 'click',
                'event_label': label,
                'event_data': getABTestingProperties()
            });
        }
    }

    function onUserConsent() {
        const consentCanNotRejected = getDomainNoConsent();
        if (consentCanNotRejected && window.s && window.s._scrollDepthObj) {
            // Calling setScrollDepthProperties() will make the current page trackable as the _ppvPreviousPage of the next page view.
            window.s._scrollDepthObj.setScrollDepthProperties(window.s);
        }
        if (consentCanNotRejected && window.s && window.s._campaignObj) {
            window.s._campaignObj.setCampaignVariables(window.s, true);
        }
    }

    function sendFirstPageViewEvent() {
        if (exportedFunctions.notPurUser()) {
            const adobeTagId = exportedFunctions.getAdobeTagId(window.utag.data['ut.profile']);
            window.utag.view(window.utag.data, null, [adobeTagId]);
        }
    }

    function onMessageChoiceSelect(messageType, id, eventType) {
        if (CONSENT_MESSAGE_EVENTS[eventType]) {
            window.utag.data['cmp_events'] = CONSENT_MESSAGE_EVENTS[eventType];
            exportedFunctions.sendLinkEvent(CONSENT_MESSAGE_EVENTS[eventType]);

            if (eventType === 11 && window.utag.data['dom.domain'] && window.utag.data['dom.domain'].includes('sportbild.bild.de'))
            {
                window.utag.loader.SC('utag_main', {'cmp_after_sub': 'true'});
                window.utag.data['cp.utag_main_cmp_after_sub'] = 'true';
            } else if(eventType === 11){
                window.utag.loader.SC('utag_main', {'cmp_after': 'true'});
                window.utag.data['cp.utag_main_cmp_after'] = 'true';
            }
            
            if (eventType === 11) {
                exportedFunctions.onUserConsent();
            }
        }
    }

    function onPrivacyManagerAction(messageType, id, eventType) {
        if (PRIVACY_MANAGER_EVENTS[eventType]) {
            window.utag.data['cmp_events'] = PRIVACY_MANAGER_EVENTS[eventType];
            exportedFunctions.sendLinkEvent(PRIVACY_MANAGER_EVENTS[eventType]);
            // Set cookie for first page view tracking.
            if ((eventType === 1 || eventType === 11) && window.utag.data['dom.domain'] && window.utag.data['dom.domain'].includes('sportbild.bild.de')){
                window.utag.loader.SC('utag_main', {'cmp_after_sub': 'true'});
                window.utag.data['cp.utag_main_cmp_after_sub'] = 'true';    
            }else if (eventType === 1 || eventType === 11){
                window.utag.loader.SC('utag_main', {'cmp_after': 'true'});
                window.utag.data['cp.utag_main_cmp_after'] = 'true';
            }
            if (eventType === 1 || eventType === 11) {
                exportedFunctions.onUserConsent();
            }
        }
    }

    function onCmpuishown(tcData) {
        window.utag.data.cmp_event_status = tcData.eventStatus;
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

    // user is PUR subscriber, we are not allowed to track
    // if WHOAMI then user_hasPurSubscription2, if Aubi/Cobi/BOOKs Cookie _cpauthhint
    function notPurUser() {
        if (window.utag.data.user_hasPurSubscription2 === 'true' || window.utag.data['cp._cpauthhint'] === '1') {
            return false;
        }
    
        return true;
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
