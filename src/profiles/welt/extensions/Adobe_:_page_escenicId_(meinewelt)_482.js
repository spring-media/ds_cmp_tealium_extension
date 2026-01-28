/* eslint-disable */
/* Based on SET DATA VALUE Adobe : page_escenicId (meinewelt) 482 */
/* global utag, a, b */
(function(a, b) {
    try {
        if ((typeof b['dom.pathname'] != 'undefined' && /^meinewelt/.test(b['dom.pathname']))) {
            b['page_escenicId'] = b['_pathname1'];
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
