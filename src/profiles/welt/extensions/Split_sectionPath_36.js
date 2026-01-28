/* eslint-disable */
/* Based on SET DATA VALUE Split sectionPath 36 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (typeof b['page_sectionPath'] != 'undefined') {
            try {
                b['page_channel1'] = (b['page_sectionPath'].split("/")[1] !== undefined) ? b['page_sectionPath'].split("/")[1].toLowerCase(): "";
            } catch (e) {}
            try {
                b['page_channel2'] = (b['page_sectionPath'].split("/")[2] !== undefined) ? b['page_sectionPath'].split("/")[2].toLowerCase() : "";
            } catch (e) {}
            try {
                b['page_channel3'] = (b['page_sectionPath'].split("/")[3] !== undefined) ? b['page_sectionPath'].split("/")[3].toLowerCase() : "";
            } catch (e) {}
            try {
                b['page_channel4'] = (b['page_sectionPath'].split("/")[4] !== undefined) ? b['page_sectionPath'].split("/")[4].toLowerCase() : "";
            } catch (e) {}
            try {
                b['page_channel5'] = (b['page_sectionPath'].split("/")[5] !== undefined) ? b['page_sectionPath'].split("/")[5].toLowerCase() : "";
            } catch (e) {}
            try {
                b['page_sectionAnchor'] = b['page_sectionPath'].split("/")[b['page_sectionPath'].split("/").length-2].toLowerCase();
            } catch (e) {}
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
