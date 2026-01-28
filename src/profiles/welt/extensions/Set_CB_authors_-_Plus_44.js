/* eslint-disable */
/* Based on SET DATA VALUE Set CB authors - Plus 44 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (b['page_isPremium'] == 'true') {
             b['cb_authors'] = 'Plus';
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
