/* eslint-disable */
/* Based on SET DATA VALUE epaper mapping standards (Page_document_type, sections) 404 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (b['dom.domain'] == 'epaper.welt.de') {
            b['page_sectionPath'] = b['dom.pathname'];
            b['page_channel1'] = b['_pathname1'];
            b['page_channel2'] = b['_pathname4'];
            b['page_channel3'] = b['_pathname5'];
             b['page_escenicId'] = 'pdf';
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
