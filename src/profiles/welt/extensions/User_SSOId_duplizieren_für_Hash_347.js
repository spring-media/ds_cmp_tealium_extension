/* eslint-disable */
/* Based on SET DATA VALUE User SSOId duplizieren für Hash 347 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (1) {
            b['double_sso_id'] = b['cp.utag_main_uid'];
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
