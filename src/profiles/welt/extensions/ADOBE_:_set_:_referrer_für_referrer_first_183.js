/* Based on SET DATA VALUE ADOBE : set : referrer für referrer first 183 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (typeof b['cp.ref_first'] != 'undefined') {
            b['ad_referrer_first'] = b['cp.ref_first'];
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
