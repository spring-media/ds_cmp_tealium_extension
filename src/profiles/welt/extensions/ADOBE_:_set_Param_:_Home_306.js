/* Based on SET DATA VALUE ADOBE : set Param : Home 306 */
/* global utag, a, b */
(function(a, b) {
    try {
        if ((b['page_sectionPath'] == '/' && b['page_type'] == 'section' && b['dom.domain'] != 'epaper.welt.de')) {
             b['page_type'] = 'home';
            try {
                b['page_escenicId'] = b.page_escenicId == undefined ? b.page_channel1 : b.page_escenicId;
            } catch (e) {}
            try {
                b['adobe_pageName'] = "home : " + b.page_escenicId;
            } catch (e) {}
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
