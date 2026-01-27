/* Based on SET DATA VALUE Get SSOId aus Utag_main falls nicht im DataLayer verfügbar 340 */
/* global utag, a, b */
(function(a, b) {
    try {
        if ((typeof b['user_ssoId'] == 'undefined' || b['user_ssoId'] == '')) {
            b['double_sso_id'] = b['cp.utag_main_uid'];
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
