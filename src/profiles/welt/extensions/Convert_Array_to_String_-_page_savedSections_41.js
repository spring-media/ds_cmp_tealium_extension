/* Based on SET DATA VALUE Convert Array to String - page_savedSections 41 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (typeof b['page_savedSections'] != 'undefined') {
            try {
                b['page_savedSections_string'] = b['page_savedSections'].join(",");
            } catch (e) {}
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
