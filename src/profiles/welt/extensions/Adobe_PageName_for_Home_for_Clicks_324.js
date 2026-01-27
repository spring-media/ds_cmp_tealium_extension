/* Based on SET DATA VALUE Adobe PageName for Home for Clicks 324 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (b['page_sectionPath'] == '/') {
            try {
                b['adobe_pageName'] = p.page_type + " : " + p.page_escenicId;
            } catch (e) {}
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
