(function () {
    const OLD_STORAGE_KEY = '__utag_cmp_vendor_list';

    const SUB_DOMAINS = ['sportbild', 'shop.welt.de', 'bildplusshop.bild.de'];
    const CLUB_DOMAIN = ['club'];
    
    const NEW_STORAGE_KEY = (CLUB_DOMAIN.indexOf(window.location.hostname) >-1) ?
        'cmp_cv_list_club' :
        (SUB_DOMAINS.indexOf(window.location.hostname) >-1 ?
            'cm_cv_list' :
            'cmp_cv_list'
        );

    // Vendor Array for Bild and Welt
    const vendorArray = [
        { 'name': '1plusX', 'id': '92' },
        { 'name': 'ad_alliance_ip', 'id': '789' },
        { 'name': 'adobe_analytics', 'id': '5ed7a9a9e0e22001da9d52ad' },
        { 'name': 'adobe_cmp', 'id': '5ef9ba4992c0a20a247f2d87' },
        { 'name': 'adup', 'id': '5ed6aeb2b8e05c4a1160fe92' },
        { 'name': 'adsense', 'id': '5e74df5ff443bb795772df9c' },
        { 'name': 'adwords', 'id': '5e74df5ff443bb795772df9c' },
        { 'name': 'agf', 'id': '5ef4ba9d744f1a148a3450f4' },
        { 'name': 'agf1', 'id': '5ef5c3a5b8e05c69980eaa5b' },
        { 'name': 'agf2', 'id': '5f9be0a9a228636148510755' },
        { 'name': 'appnexus', 'id': '5e542b3a4cd8884eb41b5a6c' },
        { 'name': 'awin', 'id': '5e7f6927b8e05c48537f6074' },
        { 'name': 'bingads', 'id': '5e7786abf443bb795772efee' }, //old 20240731
        { 'name': 'bingads', 'id': '62a312aa293cdf1b5e6a2509' },
        { 'name': 'chartbeat', 'id': '5ea172e36ede87504f7b4590' },
        { 'name': 'exactag', 'id': '5ebee9f5b8e05c43d547d7d1' },
        { 'name': 'fb_ca', 'id': '5ee91b9593fc094b59242e26' },
        { 'name': 'fb_cp', 'id': '5ee91b9593fc094b59242e27' },
        { 'name': 'floodlight', 'id': '755' },
        { 'name': 'google_analytics', 'id': '5e542b3a4cd8884eb41b5a72' },
        { 'name': 'google_fallback', 'id': '5f1aada6b8e05c306c0597d7' },
        { 'name': 'google_firebase', 'id': '5ee9e9b4182da52f42468bb8' },
        { 'name': 'kameleoon', 'id': '5f48d229b8e05c60a307ad97' },
        { 'name': 'outbrain', 'id': '5e7ced57b8e05c485246ccde' },
        { 'name': 'outbrain_iab', 'id': '164' },
        { 'name': 'piano_alt', 'id': '5f7701fb3d44b8023188fba6' },
        { 'name': 'piano_n', 'id': '5eec8924b8e05c699567f398' },
        { 'name': 'piano_o', 'id': '5ea797944e5aa15059ff5a28' },
        { 'name': 'sociomantic', 'id': '5ebcb4a92fcde131e4d1a92a' },
        { 'name': 'taboola', 'id': '5e37fc3e56a5e6615502f9c4' },
        { 'name': 'tealium_collect', 'id': '5ef5f18f50fefa143f611d21' },
        { 'name': 'xandr', 'id': '5e7ced57b8e05c4854221bba' },
        { 'name': 'snowplow', 'id': '5eaaa739a55a2d743f32f7c3' }
    ];

    /* Tealium tag values for different vendors for bild and welt.
    If the tag is deactivated or the tag number is changed in Tealium,
    the tag numbers will need to be updated below. */ 
    const domainTagValues = {
        piano: {
            bild: [16],
            welt: [230],
            fitbook: [43],
            myhomebook: [46],
            petbook: [83],
            stylebook: [32],
            techbook: [87],
            travelbook: [48],
            bz: [11],
            autobild: [11],
            computerbild: [11]
        },
        kameleoon: {
            bild: [24],
            welt: [209, 242]
        },
        adobeDeals: {
            bild: [5]
        },
        adobeClub: {
            bild: [5]
        },
        googleAds: {
            bild: [21],
            welt: [147]
        },
        nielsenAgf: {
            welt: [251],
            fitbook: [15],
            myhomebook: [12],
            petbook: [91],
            stylebook: [53],
            techbook: [105],
            travelbook: [72]
        }
    };

    function getDomainTagValue(domain, vendor) {
        if (domain.includes('welt.de')) {
            return domainTagValues[vendor].welt;
        } else if (domain.includes('bild.de')) {
            return domainTagValues[vendor].bild;
        } else if (domain.includes('fitbook.de') || domain.includes('magazine-fitbook.com')) {
            return domainTagValues[vendor].fitbook;
        }else if (domain.includes('myhomebook.de') || domain.includes('magazine-myhomebook.com')) {
            return domainTagValues[vendor].myhomebook;
        }else if (domain.includes('petbook.de') || domain.includes('magazine-petbook.com')) {
            return domainTagValues[vendor].petbook;
        }else if (domain.includes('stylebook.de') || domain.includes('magazine-stylebook.com')) {
            return domainTagValues[vendor].stylebook;
        }else if (domain.includes('techbook.de') || domain.includes('magazine-techbook.com')) {
            return domainTagValues[vendor].techbook;
        }else if (domain.includes('travelbook.de') || domain.includes('magazine-travelbook.com')) {
            return domainTagValues[vendor].travelbook;
        }else {
            // Return nothing if domain doesn't match
            return null;
        }
    }

    function getCookie(name) {
        var cName = name + '=';
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var c = cookies[i];
            while (c.charAt(0) === ' ')
                c = c.substring(1, c.length);
            if (c.indexOf(cName) === 0)
                return c.substring(cName.length, c.length);
        }
        return null;
    }

    function setCookie(name, value, days) {
        var expires = '';
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toUTCString();
        }
        document.cookie = name + '=' + (value || '') + expires + '; path=/; secure; domain=.' + window.location.hostname.split('.').reverse().splice(0, 2).reverse().join('.');
        deleteCookie(OLD_STORAGE_KEY);
    }

    function deleteCookie(name) {
        document.cookie = name + '=; expires=' + new Date(0).toUTCString();
    }

    const fetchConsentData = function () {
        return new Promise(function (resolve, reject) {
            window.__tcfapi('getCustomVendorConsents', 2, function (data, success) {
                if (!success) {
                    return reject();
                }
                resolve(data);
            });
        });
    };

    const spCMPisEnabled = function () {
        return window.__tcfapi;
    };

    const getGrantedVendors = function (cb) {
        var cmp_customvendor = '';
        var currentGrants = getCookie(NEW_STORAGE_KEY) || getCookie(OLD_STORAGE_KEY);
        fetchConsentData().then(function (data) {
            if (!data) {
                return;
            }
            vendorArray.forEach(function (vendor) {
                if (data && data.grants && data.grants[vendor.id] && data.grants[vendor.id].vendorGrant) {
                    cmp_customvendor += vendor.name + ',';
                }
            });
            setCookie(NEW_STORAGE_KEY, cmp_customvendor, 30);
            if (cb) {
                cb(cmp_customvendor, cmp_customvendor.length && (currentGrants === null || currentGrants === ''));
            }
        });
    };

    const processUtag = function () {
        if (!window.__utag_view_fired) {
            window.__utag_view_fired = true;

            var existingCookie = document.cookie.match(/cmp_cv_list=([a-zA-z0-9_,-]*)/);
            var existingFallbackCookie = document.cookie.match(/__utag_cmp_vendor_list=([a-zA-z0-9_,-]*)/);

            // Adobe deals, adobe club run only for Bild
            if (window.location.hostname.includes('bild.de')) {
                if ((existingCookie && existingCookie[0].indexOf('adobe_analytics') >= 0)
                    || (existingFallbackCookie && existingFallbackCookie[0].indexOf('adobe_analytics') >= 0)
                ) {

                    //adobe deals
                    if (document.URL.includes('bild.de/deals')) {

                        window.utag.view(window.utag.data, null, domainTagValues.adobeDeals.bild);
                    }

                    //adobe club
                    if ((window.location.hostname && window.location.hostname.includes('club')) && window.utag.data['cp.utag_main_cmp_after'] == 'true') {

                        window.utag.view(window.utag.data, null, domainTagValues.adobeClub.bild);
                    }
                }
            }

            //cxense/piano 
            if (((existingCookie && existingCookie[0].indexOf('piano') >= 0)
                || (existingFallbackCookie && existingFallbackCookie[0].indexOf('piano') >= 0))
                && !!getDomainTagValue(window.location.hostname, 'piano')) {

                window.utag.view(window.utag.data, null, getDomainTagValue(window.location.hostname, 'piano'));
            }

            //google ads
            if (((existingCookie && existingCookie[0].indexOf('google_fallback') >= 0)
                || (existingFallbackCookie && existingFallbackCookie[0].indexOf('google_fallback') >= 0))
                && !!getDomainTagValue(window.location.hostname, 'googleAds')) {

                window.utag.view(window.utag.data, null, getDomainTagValue(window.location.hostname, 'googleAds'));
            }            

            //nielsenAgf
            if (((existingCookie && existingCookie[0].indexOf('agf') >= 0)
                || (existingFallbackCookie && existingFallbackCookie[0].indexOf('agf') >= 0))
                && !!getDomainTagValue(window.location.hostname, 'nielsenAgf')) {

                window.utag.view(window.utag.data, null, getDomainTagValue(window.location.hostname, 'nielsenAgf'));
            }
            //kameleoon
            if (((existingCookie && existingCookie.includes('kameleoon')
                || existingFallbackCookie && existingFallbackCookie.includes('kameleoon'))
                && (window.utag.data.user_hasPurSubscription === 'false'
                || (!window.utag.data['cp._cpauthhint']
                || !(window.utag.data['cp._cpauthhint']?.includes('1')))))
                && !!getDomainTagValue(window.location.hostname, 'kameleoon')) {
                        
                window.utag.view(window.utag.data, null, getDomainTagValue(window.location.hostname, 'kameleoon'));
            }
        }
    };

    const init = function () {
        if (spCMPisEnabled()) {
            if (!window.__utag_layer_tracking_init) {
                window.__utag_layer_tracking_init = true;
                getGrantedVendors();
                window.__tcfapi('addEventListener', 2, function (tcData) {
                    if (tcData && tcData.eventStatus === 'useractioncomplete') {
                        getGrantedVendors(processUtag);
                    }
                });
            }
        }
    };

    // Create a centralized reference to all members of this unit which needs be exposed for unit testing.
    const exportedFunctions = {
        getDomainTagValue,
        getCookie,
        setCookie,
        deleteCookie,
        fetchConsentData,
        spCMPisEnabled,
        getGrantedVendors,
        processUtag,
        init,
    };

    // Evaluate runtime environment (Browser or Node.js)
    if (typeof exports === 'object') {
        // Expose reference to members for unit testing.
        module.exports = exportedFunctions;
    } else {
        // Call entry point in browser context.
        init();
    }
    
})();