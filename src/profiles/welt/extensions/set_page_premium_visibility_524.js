/* eslint-disable */
/* Based on SET DATA VALUE set page_premium_visibility 524 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (typeof b['page_isPremium'] != 'undefined') {
            try {
                b['page_premium_visibility'] = (utag.data.page_isPremium && utag.data.page_isPremium === 'true' && utag.data.user_hasPlusSubscription2 && utag.data.user_hasPlusSubscription2 === 'false') ? 'false' : 'true';
            } catch (e) {}
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
