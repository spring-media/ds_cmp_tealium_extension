/* Based on SET DATA VALUE Adobe : set APP Name 594 */
/* global utag, a, b */
(function(a, b) {
    try {
        if ((b['page_sub_type'] != 'webview' || typeof b['page_sub_type'] == 'undefined' || typeof b['app_name'] == 'undefined' || b['dom.domain'] != 'asbs.businessinsider.de')) {
            b['app_name'] = 'WELT.de';
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
