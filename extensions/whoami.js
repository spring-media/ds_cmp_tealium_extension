/* eslint-disable */
var isLoggingEnabled = true;
var whoamiCookieName = 'asinfo';

// remove logs if no issues , messages not needed
function _whoamiSnipped_log(message) {
    if (isLoggingEnabled && console !== undefined && console.log !== undefined) {
        console.log(message);
    }
}

function _whoamiSnipped_getAsInfo(windowLike = window) {
    try {
        var cookieString = windowLike.document.cookie;
        var cookies = cookieString.split(';').reduce((cookies, cookie) => {
            const [name, value] = cookie.split('=').map(c => c.trim());
            cookies[name] = value;
            return cookies;
        }, {});
        var asInfoCookie = cookies[whoamiCookieName];
        if (!asInfoCookie) {
            return null;
        }
        return JSON.parse(atob(asInfoCookie.replaceAll('"', '')));
    } catch (e) {
        _whoamiSnipped_log('whoami : cannot parse asinfo');
        windowLike.utag.data.errors = 'whoami-cookie-parsing';
        return null;
    }
}

function updateUserSubscriptionsStatus(domain, windowLike = window) {
    const subscriptionsConfig = {
        'welt.de': {
            pur: ['welt-pur'],
            subscriptions: ['weltplus']
        },
        'bild.de': {
            pur: ['bild-pur'],
            subscriptions: ['bildplus']
        }
    };

    // Find configurations based on domain
    const matchingDomain = Object.keys(subscriptionsConfig).find(d => domain.includes(d));

    if (matchingDomain) {
        const config = subscriptionsConfig[matchingDomain];

        const isPur = config.pur.some(element =>
            windowLike.utag.data.user_entitlements2.includes(element)
        );
        windowLike.utag.data.user_hasPurSubscription2 =
            windowLike.utag.data.user_entitlements2 && isPur ? 'true' : 'false';

        const isSubscriber = config.subscriptions.some(element =>
            windowLike.utag.data.user_entitlements2.includes(element)
        );
        windowLike.utag.data.user_hasPlusSubscription2 =
            windowLike.utag.data.user_entitlements2 && isSubscriber ? 'true' : 'false';
    }
}

function handleWhoami(windowLike = window) {
    var asinfo = _whoamiSnipped_getAsInfo(windowLike);
    var isLoggedIn = asinfo !== null && asinfo.subOrigin === 'as';
    windowLike.utag.data.user_isLoggedIn2 = isLoggedIn === true ? 'true' : 'false';
    if (windowLike.utag.data.user_isLoggedIn2 === 'false') {
        windowLike.utag.data.user_hasPurSubscription2 = 'false';
        windowLike.utag.data.user_hasPlusSubscription2 = 'false';
        windowLike.utag.data.user_jaId2 = 'false';
        windowLike.utag.data.user_entitlements2 = 'false';
    }

    if (isLoggedIn) {
        var getJaId = asinfo.jaId || '';
        windowLike.utag.data.user_jaId2 = getJaId;
        var unsafePurchaseData = asinfo.purchaseData || {};

        windowLike.utag.data.user_entitlements2 = unsafePurchaseData.entitlements || [];

        updateUserSubscriptionsStatus(windowLike.location.host, windowLike);
    }
}

const exportedFunctions = {
    _whoamiSnipped_getAsInfo,
    updateUserSubscriptionsStatus,
    handleWhoami
};

// Export for tests
// Evaluate runtime environment (Browser or Node.js)
if (typeof exports === 'object') {
    // Expose reference to members for unit testing.
    module.exports = exportedFunctions;
} else {
    // Call entry point
    handleWhoami();
}
