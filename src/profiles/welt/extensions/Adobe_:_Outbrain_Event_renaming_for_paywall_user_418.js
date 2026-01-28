/* eslint-disable */
/* Based on SET DATA VALUE Adobe : Outbrain Event renaming for paywall user 418 */
/* global utag, a, b */
(function(a, b) {
    try {
        if ((b['page_isPremium'] == 'true' && b['cp.utag_main_lg'] == 'false' && b['event_name'] == 'outbrain')) {
             b['event_action'] = 'view paywall';
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
