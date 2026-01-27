/* Based on SET DATA VALUE Adobe : set APP Name Business Insider 597 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (b['dom.domain'] == 'asbs.businessinsider.de') {
             b['app_name'] = 'Business Insider';
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
