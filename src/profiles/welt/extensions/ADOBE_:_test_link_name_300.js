/* eslint-disable */
/* Based on SET DATA VALUE ADOBE : test link_name 300 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (1) {
            b['link_name'] = b['event_name'];
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
