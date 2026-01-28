/* eslint-disable */
/* Based on SET DATA VALUE ADOBE : set event_data (audio) 319 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (1) {
             b['event_data.media_type'] = 'audio';
            try {
                b['event_data.media_path'] = b['event_data']['media_path'].substr(b['event_data']['media_path'].lastIndexOf("/")+1).split(".")[0];
            } catch (e) {}
            try {
                b['event_data.media_duration'] = b['event_data']['media_duration'];
            } catch (e) {}
            try {
                b['event_data.media_headline'] = b['event_data']['media_name'];
            } catch (e) {}
            try {
                b['event_data.media_title'] = b['event_data']['media_title'];
            } catch (e) {}
            try {
                b['event_data.media_section1'] = b['event_data']['media_path'].indexOf("www.welt.de") > -1 ? b['event_data']['media_path'].substring(20).split("/")[0] : b['event_data']['media_path'].substring(1).split("/")[0];
            } catch (e) {}
            try {
                b['event_data.media_section2'] = b['event_data']['media_path'].indexOf("www.welt.de") > -1 ? b['event_data']['media_path'].substring(20).split("/")[1] : b['event_data']['media_path'].substring(1).split("/")[1];
            } catch (e) {}
            try {
                b['event_data.media_section3'] = b['event_data']['media_path'].indexOf("www.welt.de") > -1 ? b['event_data']['media_path'].substring(20).split("/")[2] : b['event_data']['media_path'].substring(1).split("/")[2];
            } catch (e) {}
            try {
                b['event_data.media_sectionAnchor'] = b['event_data']['media_path'].split("/")[b['event_data']['media_path'].split("/").length-2];
            } catch (e) {}
            try {
                b['event_data.media_player'] = b['event_data']['media_player'];
            } catch (e) {}
            try {
                b['event_data.media_id'] = b['event_data']['media_id'];
            } catch (e) {}
            try {
                b['event_data.media_keywords'] = b['page_keywords'];
            } catch (e) {}
            try {
                b['event_data.media_source'] = b['event_data']['media_source'];
            } catch (e) {}
            try {
                b['event_data.media_datePublication'] = b['event_data']['media_datePublication'];
            } catch (e) {}
            try {
                b['event_data.media_is_premium'] = b['event_data']['media_is_premium'] || 'false';
            } catch (e) {}
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
