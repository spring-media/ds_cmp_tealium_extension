(function () {
    const OLD_STORAGE_KEY = '__utag_cmp_vendor_list';
    const NEW_STORAGE_KEY = determineStorageKey(window.location.hostname);

    const vendorArray = getVendorArray();
    const domainTagValues = getDomainTagValues();

    function determineStorageKey(hostname) {
        if (hostname.includes('club')) {
            return 'cmp_cv_list_club';
        } else if (hostname.includes('sportbild')) {
            return 'cm_cv_list';
        } else {
            return 'cmp_cv_list';
        }
    }

    function getVendorArray() {
        return [
            { name: '1plusX', id: '92' },
            { name: 'ad_alliance_ip', id: '789' },
            { name: 'adobe_analytics', id: '5ed7a9a9e0e22001da9d52ad' },
            { name: 'adobe_cmp', id: '5ef9ba4992c0a20a247f2d87' },
            { name: 'adup', id: '5ed6aeb2b8e05c4a1160fe92' },
            { name: 'adsense', id: '5e74df5ff443bb795772df9c' },
            { name: 'adwords', id: '5e74df5ff443bb795772df9c' },
            { name: 'agf', id: '5ef4ba9d744f1a148a3450f4' },
            { name: 'agf1', id: '5ef5c3a5b8e05c69980eaa5b' },
            { name: 'agf2', id: '5f9be0a9a228636148510755' },
            { name: 'appnexus', id: '5e542b3a4cd8884eb41b5a6c' },
            { name: 'awin', id: '5e7f6927b8e05c48537f6074' },
            { name: 'bingads', id: '5e7786abf443bb795772efee' },
            { name: 'chartbeat', id: '5ea172e36ede87504f7b4590' },
            { name: 'exactag', id: '5ebee9f5b8e05c43d547d7d1' },
            { name: 'fb_ca', id: '5ee91b9593fc094b59242e26' },
            { name: 'fb_cp', id: '5ee91b9593fc094b59242e27' },
            { name: 'floodlight', id: '755' },
            { name: 'google_analytics', id: '5e542b3a4cd8884eb41b5a72' },
            { name: 'google_fallback', id: '5f1aada6b8e05c306c0597d7' },
            { name: 'google_firebase', id: '5ee9e9b4182da52f42468bb8' },
            { name: 'kameleoon', id: '5f48d229b8e05c60a307ad97' },
            { name: 'outbrain', id: '5e7ced57b8e05c485246ccde' },
            { name: 'outbrain_iab', id: '164' },
            { name: 'piano_alt', id: '5f7701fb3d44b8023188fba6' },
            { name: 'piano_n', id: '5eec8924b8e05c699567f398' },
            { name: 'piano_o', id: '5ea797944e5aa15059ff5a28' },
            { name: 'sociomantic', id: '5ebcb4a92fcde131e4d1a92a' },
            { name: 'taboola', id: '5e37fc3e56a5e6615502f9c4' },
            { name: 'tealium_collect', id: '5ef5f18f50fefa143f611d21' },
            { name: 'xandr', id: '5e7ced57b8e05c4854221bba' },
            { name: 'snowplow', id: '5eaaa739a55a2d743f32f7c3' }
        ];
    }

    function getDomainTagValues() {
        return {
            piano: {
                bild: [16],
                welt: [230]
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
                bild: [21]
            }
        };
    }

    function getDomainTagValue(domain, vendor) {
        if (domain.includes('welt.de')) {
            return domainTagValues[vendor].welt;
        } else if (domain.includes('bild.de')) {
            return domainTagValues[vendor].bild;
        } else {
            return [];
        }
    }

    function getCookie(name) {
        const cName = name + '=';
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(cName)) {
                return cookie.substring(cName.length);
            }
        }
        return null;
    }

    function setCookie(name, value, days) {
        let expires = '';
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toUTCString();
        }
        const domain = '.' + window.location.hostname.split('.').slice(-2).join('.');
        document.cookie = `${name}=${value || ''}${expires}; path=/; secure; domain=${domain}`;
        deleteCookie(OLD_STORAGE_KEY);
    }

    function deleteCookie(name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }

    async function fetchConsentData() {
        return new Promise((resolve, reject) => {
            window.__tcfapi('getCustomVendorConsents', 2, (data, success) => {
                if (!success) {
                    return reject();
                }
                resolve(data);
            });
        });
    }

    function spCMPisEnabled() {
        return !!window.__tcfapi;
    }

    async function getGrantedVendors(cb) {
        let cmp_customvendor = '';
        const currentGrants = getCookie(NEW_STORAGE_KEY) || getCookie(OLD_STORAGE_KEY);
        const data = await fetchConsentData();

        if (data && data.grants) {
            vendorArray.forEach(vendor => {
                if (data.grants[vendor.id]?.vendorGrant) {
                    cmp_customvendor += `${vendor.name},`;
                }
            });
            setCookie(NEW_STORAGE_KEY, cmp_customvendor, 30);
            if (cb) {
                cb(cmp_customvendor, cmp_customvendor.length && !currentGrants);
            }
        }
    }

    function processUtag() {
        if (window.__utag_view_fired) {
            return;
        }
        window.__utag_view_fired = true;

        const existingCookie = document.cookie.match(/cmp_cv_list=([a-zA-Z0-9_,-]*)/)?.[0];
        const existingFallbackCookie = document.cookie.match(/__utag_cmp_vendor_list=([a-zA-Z0-9_,-]*)/)?.[0];

        if (window.location.hostname.includes('bild.de')) {
            processBildCookies(existingCookie, existingFallbackCookie);
        }

        processCxensePianoCookies(existingCookie, existingFallbackCookie);
        processKameleoonCookies(existingCookie, existingFallbackCookie);
    }

    function processBildCookies(existingCookie, existingFallbackCookie) {
        if (existingCookie?.includes('adobe_analytics') || existingFallbackCookie?.includes('adobe_analytics')) {
            if (existingCookie.includes('adobe_analytics') && document.URL.includes('bild.de/deals')) {
                window.utag.view(window.utag.data, null, domainTagValues.adobeDeals.bild);
            }
            if (existingCookie?.includes('google_fallback') || existingFallbackCookie?.includes('google_fallback')) {
                window.utag.view(window.utag.data, null, domainTagValues.googleAds.bild);
            }
            if ((existingCookie?.includes('adobe') || existingFallbackCookie?.includes('adobe')) && window.location.hostname.includes('club') && window.utag.data['cp.utag_main_cmp_after'] === 'true') {
                window.utag.view(window.utag.data, null, domainTagValues.adobeClub.bild);
            }
        }
    }

    function processCxensePianoCookies(existingCookie, existingFallbackCookie) {
        if (existingCookie?.includes('piano') || existingFallbackCookie?.includes('piano')) {
            window.utag.view(window.utag.data, null, getDomainTagValue(window.location.hostname, 'piano'));
        }
    }

    function processKameleoonCookies(existingCookie, existingFallbackCookie) {
        if ((existingCookie?.includes('kameleoon') || existingFallbackCookie?.includes('kameleoon')) && window.utag.data['cp.hasPurSubscription'] === 'false' && window.utag.data.user_hasPurSubscription === 'false') {
            window.utag.view(window.utag.data, null, getDomainTagValue(window.location.hostname, 'kameleoon'));
        }
    }

    if (spCMPisEnabled()) {
        if (!window.__utag_layer_tracking_init) {
            window.__utag_layer_tracking_init = true;
            getGrantedVendors();
            window.__tcfapi('addEventListener', 2, tcData => {
                if (tcData && tcData.eventStatus === 'useractioncomplete') {
                    getGrantedVendors(processUtag);
                }
            });
        }
    }
})();
