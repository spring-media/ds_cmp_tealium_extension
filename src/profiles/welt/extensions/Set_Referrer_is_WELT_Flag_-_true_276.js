/* Based on SET DATA VALUE Set Referrer is WELT Flag - true 276 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (b['dom.referrer'].toString().indexOf('welt.de') > -1) {
             b['page_referrer_is_welt'] = 'true';
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
