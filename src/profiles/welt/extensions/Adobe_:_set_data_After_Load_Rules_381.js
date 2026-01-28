/* eslint-disable */
/* Based on SET DATA VALUE Adobe : set data After Load Rules 381 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (1) {
            try {
                b['event_name_and_action'] = b['event_name'] + "_" + b['event_action'];
            } catch (e) {}
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
