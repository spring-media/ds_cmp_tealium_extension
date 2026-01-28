/* eslint-disable */
/* Based on SET DATA VALUE Sportdaten mapping standards (Page_document_type, sections) 403 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (b['dom.domain'] == 'sportdaten.welt.de') {
             b['page_type'] = 'sportdaten';
            b['page_sectionPath'] = b['dom.pathname'];
            b['page_channel1'] = b['_pathname1'];
            b['page_channel2'] = b['_pathname2'];
            b['page_channel3'] = b['_pathname3'];
            try {
                b['adobe_pageName'] = 'sportdaten : ' + (utag.data._pathname1 == '' ? utag.data.page_sectionName : utag.data._pathname1);
            } catch (e) {}
            try {
                b['page_escenicId'] = 'sportdaten : ' + (utag.data._pathname1 == '' ? utag.data.page_sectionName : utag.data._pathname1);
            } catch (e) {}
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
