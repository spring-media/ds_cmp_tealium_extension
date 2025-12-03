const pur = ['weltpur', 'WLT1001284'];
const subscriptions = ['WLT1000043'];

let isDomainMatch = true;

/*const domainList = ['sonderthemen.welt.de'];
let isDomainMatch = false;
const currentDomain = location.hostname;

for (const domain of domainList) {
  if (currentDomain.includes(domain)) {
    isDomainMatch = true;
  }
}
*/
if (console !== undefined && console.log !== undefined) {
    console.log("whoami : start  ");

}
! function () {
    var n, e, o, t;
    (n = {}, e = {}, o = "pssmasloader", t = window[o] = window[o] ||
    {
        require: function (o, t) {
            var i = e[o];
            void 0 !== i ? t(i, null) : (n[o] = n[o] || [], n[o].push(t))
        },
        _:
        {
            u: n,
            p: e
        }
    }, new Promise(function (n, e) {
        t.require("whoami:v1", function (o, t) {
            t ? e(t) : n(o)
        })
    })).then(async function (whoami) {
        if (isDomainMatch) {
            try {
                const isLoggedIn = whoami.isLoggedIn()
                utag.data.user_isLoggedIn2 = isLoggedIn === true ? 'true' : 'false';
                if (utag.data.user_isLoggedIn2 === 'false') {
                    utag.data.user_hasPurSubscription2 = 'false';
                    utag.data.user_hasPlusSubscription2 = 'false';
                    utag.data.user_jaId2 = 'false';
                    utag.data.user_entitlements2 = 'false';

                }

                if (console !== undefined && console.log !== undefined) {
                    console.log("whoami : user_isLoggedIn:  " + utag.data.user_isLoggedIn2);
                }
                if (isLoggedIn) {
                    const getJaId = whoami.getJaId();
                    utag.data.user_jaId2 = getJaId;

                    const unsafePurchaseData = await whoami.getUnsafePurchaseData();

                    utag.data.user_entitlements2 = unsafePurchaseData.entitlements || [];

                    const isPur = pur.some(element => utag.data.user_entitlements2.includes(element));
                    utag.data.user_hasPurSubscription2 = utag.data.user_entitlements2 && isPur ? 'true' : 'false';

                    const isSubscriber = subscriptions.some(element => utag.data.user_entitlements2.includes(element));
                    utag.data.user_hasPlusSubscription2 = utag.data.user_entitlements2 && isSubscriber ? 'true' : 'false';
                    //debug console logs
                    if (console !== undefined && console.log !== undefined) {
                        console.log("whoami : user_jaId2:  " + utag.data.user_jaId2);
                        console.log("whoami : user_entitlements2:  " + utag.data.user_entitlements2);
                        console.log("whoami : user_hasPurSubscription2:  " + utag.data.user_hasPurSubscription2);
                        console.log("whoami : user_hasPlusSubscription2:  " + utag.data.user_hasPlusSubscription2);
                    }
                }
            } catch (error) {
                console.error("whoami : Failed to retrieve user information:", error);
            }
        }
    }).catch(function () {
        console.error("handle unavilability of whoami api")
    })
}();
//# sourceMappingURL=index.js.map