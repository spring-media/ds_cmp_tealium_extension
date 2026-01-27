/* Based on SET DATA VALUE ADOBE: is_status_premium 438 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (typeof b['page_isPremium'] != 'undefined') {
            b['is_status_premium'] = b['page_isPremium'];
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
