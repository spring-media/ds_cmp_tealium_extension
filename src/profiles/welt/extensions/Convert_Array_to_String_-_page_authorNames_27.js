/* eslint-disable */
/* Based on SET DATA VALUE Convert Array to String - page_authorNames 27 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (typeof b['page_authorNames'] != 'undefined') {
            try {
                b['page_authorNames_string'] = b['page_authorNames'].join(';');
            } catch (e) {}
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
