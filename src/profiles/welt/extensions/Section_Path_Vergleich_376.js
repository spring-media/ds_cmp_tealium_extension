/* Based on SET DATA VALUE Section Path Vergleich 376 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (/^/vergleich//.test(b['dom.pathname'])) {
            try {
                b['page_channel1'] = (b['dom.pathname'].split("/")[1] !== undefined) ? b['dom.pathname'].split("/")[1] : "";
            } catch (e) {}
            try {
                b['page_channel2'] = (b['dom.pathname'].split("/")[2] !== undefined) ? b['dom.pathname'].split("/")[2] : "";
            } catch (e) {}
            try {
                b['page_channel3'] = (b['dom.pathname'].split("/")[3] !== undefined) ? b['dom.pathname'].split("/")[3] : "";
            } catch (e) {}
            try {
                b['page_channel4'] = (b['dom.pathname'].split("/")[4] !== undefined) ? b['dom.pathname'].split("/")[4] : "";
            } catch (e) {}
            try {
                b['page_channel5'] = (b['dom.pathname'].split("/")[5] !== undefined) ? b['dom.pathname'].split("/")[5] : "";
            } catch (e) {}
            try {
                b['page_sectionAnchor'] = b['page_sectionPath'].split("/")[b['page_sectionPath'].split("/").length-2];
            } catch (e) {}
            b['page_sectionPath'] = b['dom.pathname'];
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
