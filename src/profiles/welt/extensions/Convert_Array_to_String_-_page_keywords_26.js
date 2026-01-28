/* eslint-disable */
/* Based on SET DATA VALUE Convert Array to String - page_keywords 26 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (typeof b['page_keywords'] != 'undefined') {
            try {
                b['page_keywords_string'] = b['page_keywords'].join(";");
            } catch (e) {}
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
