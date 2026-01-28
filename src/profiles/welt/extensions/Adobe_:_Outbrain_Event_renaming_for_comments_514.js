/* eslint-disable */
/* Based on SET DATA VALUE Adobe : Outbrain Event renaming for comments 514 */
/* global utag, a, b */
(function(a, b) {
    try {
        if ((/^comment/.test(b['dom.hash']) && b['event_name'] == 'outbrain')) {
             b['event_action'] = 'view comment';
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
