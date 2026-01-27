/* Based on SET DATA VALUE baletterkatalog mapping standards (Page_document_type, sections) 460 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (b['dom.domain'] == 'blaetterkatalog.welt.de') {
            b['page_sectionPath'] = b['dom.pathname'];
            b['page_channel1'] = b['_pathname1'];
            b['page_channel2'] = b['_pathname4'];
            b['page_channel3'] = b['_pathname5'];
            try {
                b['page_escenicId'] = utag.data._pathname4 + "_" +utag.data._pathname5;
            } catch (e) {}
            try {
                b['adobe_pageName'] = 'blaetterkatalog : ' + utag.data._pathname4 + "_" +utag.data._pathname5;
            } catch (e) {}
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
