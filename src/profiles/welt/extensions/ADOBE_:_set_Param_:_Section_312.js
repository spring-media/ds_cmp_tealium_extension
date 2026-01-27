/* Based on SET DATA VALUE ADOBE : set Param : Section 312 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (b['page_type'] == 'section') {
            try {
                b['page_escenicId'] = b.page_escenicId == undefined ? b.page_channel1 : b.page_escenicId;
            } catch (e) {}
            try {
                b['adobe_pageName'] = b.page_type + " : " + b.page_escenicId;
            } catch (e) {}
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
