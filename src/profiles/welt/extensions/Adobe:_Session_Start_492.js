/* Based on SET DATA VALUE Adobe: Session Start 492 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (b['cp.utag_main__ss'] == '1') {
             b['is_session_start'] = '1';
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
