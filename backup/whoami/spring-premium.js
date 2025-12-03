//statics WELT
const purWelt = ['weltpur', 'WLT1001284'];
const subscriptionsWelt = ['WLT1000043'];

//statics BILD
const purBild = ['bildpur', 'BDE1001282'];
const subscriptionsBild = ['BDE1000351'];

var isDomainMatch = true;
var isLoggingEnabled = true;
var whoamiCookieName = "asinfo";


function _whoamiSnipped_log(message) {
    if (isLoggingEnabled && console !== undefined && console.log !== undefined) {
        console.log(message);
    }
}

_whoamiSnipped_log("whoami : start  ");
! function() {
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

    function _whoamiSnipped_getUserdataEntitlements() {
        try {
            var cookieString = document.cookie;
            var cookies = cookieString.split(';').reduce((cookies, cookie) => {
                const [name, value] = cookie.split('=').map(c => c.trim());
                cookies[name] = value;
                return cookies;
            }, {});
            var userdataCookie = cookies["userdata"];
            if (!userdataCookie) {
                return null;
            }
            var decoded = atob(userdataCookie);
            var body = decoded.split('###')[0];
            return JSON.parse(body).p || [];
        } catch (e) {
            _whoamiSnipped_log("whoami : cannot parse userdata");
            utag.data.errors = "userdata-cookie-parsing";
            return null;
        }
    }

    if (isDomainMatch) {
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

            if (location.host.includes('welt.de')) {
                const isPur = purWelt.some(element => utag.data.user_entitlements2.includes(element));
                utag.data.user_hasPurSubscription2 = utag.data.user_entitlements2 && isPur ? 'true' : 'false';

                const isSubscriber = subscriptionsWelt.some(element => utag.data.user_entitlements2.includes(element));
                utag.data.user_hasPlusSubscription2 = utag.data.user_entitlements2 && isSubscriber ? 'true' : 'false';

            } else if (location.host.includes('bild.de')) {
                const isPur = purBILD.some(element => utag.data.user_entitlements2.includes(element));
                utag.data.user_hasPurSubscription2 = utag.data.user_entitlements2 && isPur ? 'true' : 'false';

                const isSubscriber = subscriptionsBild.some(element => utag.data.user_entitlements2.includes(element));
                utag.data.user_hasPlusSubscription2 = utag.data.user_entitlements2 && isSubscriber ? 'true' : 'false';
            }
            //debug console logs
            _whoamiSnipped_log("whoami : user_jaId2:  " + utag.data.user_jaId2);
            _whoamiSnipped_log("whoami : user_entitlements2:  " + utag.data.user_entitlements2);
            _whoamiSnipped_log("whoami : user_hasPurSubscription2:  " + utag.data.user_hasPurSubscription2);
            _whoamiSnipped_log("whoami : user_hasPlusSubscription2:  " + utag.data.user_hasPlusSubscription2);
        }

        // debug logic for entitlements
        var legacyEntitlements = _whoamiSnipped_getUserdataEntitlements();
        var haslegacyUserDataEntitlements = legacyEntitlements && legacyEntitlements.length > 0 && subscriptions.some(element => legacyEntitlements.includes(element));

        if (haslegacyUserDataEntitlements) {
            if (isSubscriber) {
                // whoami + casino
                utag.data.errors = "subscriber-whoami-and-casino";
            } else {
                // only legacy ==> problem
                utag.data.errors = "subscriber-casino-only";
            }
        } else {
            if (isSubscriber) {
                // whoami & not casino
                utag.data.errors = "subscriber-whoami-only";
            } else {
                // no subscriber
                utag.data.errors = "no-subscriber-at-all";
            }
        }
        _whoamiSnipped_log("whoami : legacy subs:  " + legacyEntitlements);
        _whoamiSnipped_log("whoami : sub info:  " + utag.data.errors);

    }
}();
//# sourceMappingURL=index.js.map