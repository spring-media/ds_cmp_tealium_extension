var isLoggingEnabled = true;
var whoamiCookieName = "asinfo";


// remove logs if no issues , messages not needed
function _whoamiSnipped_log(message) {
    if (isLoggingEnabled && console !== undefined && console.log !== undefined) {
        console.log(message);
    }
}

_whoamiSnipped_log("whoami : start  ");

! function () {
    function _whoamiSnipped_getAsInfo() {
        try {
            var cookieString = document.cookie;
            var cookies = cookieString.split(';').reduce((cookies, cookie) => {
                const [name, value] = cookie.split('=').map(c => c.trim());
                cookies[name] = value;
                return cookies;
            }, {});
            var asInfoCookie = cookies[whoamiCookieName];
            if (!asInfoCookie) {
                return null;
            }
            return JSON.parse(atob(asInfoCookie.replaceAll('"', '')));;
        } catch (e) {
            _whoamiSnipped_log("whoami : cannot parse asinfo");
            utag.data.errors = "whoami-cookie-parsing";
            return null;
        }
    }

    function updateUserSubscriptionsStatus(domain) {
        const subscriptionsConfig = {
            'welt.de': {
                pur: ['weltpur', 'WLT1001284'],
                subscriptions: ['WLT1000043']
            },
            'bild.de': {
                pur: ['bildpur', 'BDE1001282'],
                subscriptions: ['BDE1000351']
            }
        };

        // Find configurations based on domain
        const matchingDomain = Object.keys(subscriptionsConfig).find(d => domain.includes(d));

        if (matchingDomain) {
            const config = subscriptionsConfig[matchingDomain];

            const isPur = config.pur.some(element => utag.data.user_entitlements2.includes(element));
            utag.data.user_hasPurSubscription2 = utag.data.user_entitlements2 && isPur ? 'true' : 'false';

            const isSubscriber = config.subscriptions.some(element => utag.data.user_entitlements2.includes(element));
            utag.data.user_hasPlusSubscription2 = utag.data.user_entitlements2 && isSubscriber ? 'true' : 'false';
        }
    }

    var asinfo = _whoamiSnipped_getAsInfo();
    var isLoggedIn = asinfo !== null && asinfo.subOrigin === "as";
    utag.data.user_isLoggedIn2 = isLoggedIn === true ? 'true' : 'false';
    if (utag.data.user_isLoggedIn2 === 'false') {
        utag.data.user_hasPurSubscription2 = 'false';
        utag.data.user_hasPlusSubscription2 = 'false';
        utag.data.user_jaId2 = 'false';
        utag.data.user_entitlements2 = 'false';

    }
    utag.data.user_hasPlusSubscription2 = 'false';
    _whoamiSnipped_log("whoami : user_isLoggedIn:  " + utag.data.user_isLoggedIn2);

    var isSubscriber = false;
    if (isLoggedIn) {
        var getJaId = asinfo.jaId || "";
        utag.data.user_jaId2 = getJaId;
        var unsafePurchaseData = asinfo.purchaseData || {};

        utag.data.user_entitlements2 = unsafePurchaseData.entitlements || [];

        updateUserSubscriptionsStatus(window.location.host);
       
        //remove debug console logs after everything is working
        _whoamiSnipped_log("whoami : user_jaId2:  " + utag.data.user_jaId2);
        _whoamiSnipped_log("whoami : user_entitlements2:  " + utag.data.user_entitlements2);
        _whoamiSnipped_log("whoami : user_hasPurSubscription2:  " + utag.data.user_hasPurSubscription2);
        _whoamiSnipped_log("whoami : user_hasPlusSubscription2:  " + utag.data.user_hasPlusSubscription2);
    }
}();