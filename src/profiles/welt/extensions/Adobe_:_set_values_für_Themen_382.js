/* Based on SET DATA VALUE Adobe : set values für Themen 382 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (/^/themen//.test(b['dom.pathname'])) {
             b['page_type'] = 'themen';
            try {
                b['page_escenicId'] = b.page_escenicId == undefined && adSSetup != undefined ? adSSetup.pid : b.page_escenicId;
            } catch (e) {}
            b['page_channel1'] = b['_pathname1'];
            b['page_channel2'] = b['_pathname2'];
            try {
                b['adobe_pageName'] = b._pathname1 + " : " + b.page_escenicId;
            } catch (e) {}
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
