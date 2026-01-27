/* Based on SET DATA VALUE Adobe: Page Section 1 Fallback Home 352 */
/* global utag, a, b */
(function(a, b) {
    try {
        if ((b['dom.pathname'] == '/' && b['dom.url'].toString().indexOf('www.welt.de') > -1)) {
             b['page_channel1'] = 'home';
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
