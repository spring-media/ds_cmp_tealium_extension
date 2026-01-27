/* Based on SET DATA VALUE ADOBE : set event_data (video) 305 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (1) {
            try {
                b['event_data.media_id'] = b['event_data']['media_id'];
            } catch (e) {}
            try {
                b['event_data.media_type'] = b['event_data']['media_type'];
            } catch (e) {}
            try {
                b['event_data.media_path'] = b['event_data']['media_path'];
            } catch (e) {}
            try {
                b['event_data.media_duration'] = b['event_data']['media_duration'];
            } catch (e) {}
            try {
                b['event_data.media_is_autoplay'] = b['event_data']['media_is_autoplay'];
            } catch (e) {}
            try {
                b['event_data.media_is_live'] = b['event_data']['media_is_live'];
            } catch (e) {}
            try {
                b['event_data.media_is_fullscreen'] = b['event_data']['media_is_fullscreen'];
            } catch (e) {}
            try {
                b['event_data.media_is_muted'] = b['event_data']['media_is_muted'];
            } catch (e) {}
            try {
                b['event_data.media_is_premium'] = b['event_data']['media_is_premium'];
            } catch (e) {}
            try {
                b['event_data.media_kicker'] = b['event_data']['media_kicker'];
            } catch (e) {}
            try {
                b['event_data.media_headline'] = b['event_data']['media_headline'];
            } catch (e) {}
            try {
                b['event_data.media_placement'] = b['event_data']['media_placement'];
            } catch (e) {}
            try {
                b['event_data.media_is_premiumvisibility'] = b['event_data']['media_is_premiumvisibility'];
            } catch (e) {}
            try {
                b['event_data.media_keywords'] = b['event_data']['media_keywords'];
            } catch (e) {}
            try {
                b['event_data.media_title'] = b['event_data']['media_title'];
            } catch (e) {}
            try {
                b['event_data.media_section1'] = b['event_data']['media_path'].substring(1).split("/")[0];
            } catch (e) {}
            try {
                b['event_data.media_section2'] = b['event_data']['media_path'].substring(1).split("/")[1];
            } catch (e) {}
            try {
                b['event_data.media_section3'] = b['event_data']['media_path'].substring(1).split("/")[2];
            } catch (e) {}
            try {
                b['event_data.media_sectionAnchor'] = b['event_data']['media_path'].split("/")[b['event_data']['media_path'].split("/").length-2];
            } catch (e) {}
            try {
                b['event_data.media_source'] = b['event_data']['media_source'];
            } catch (e) {}
            try {
                b['event_data.media_datePublication'] = b['event_data']['media_datePublication'].substring(0,10);
            } catch (e) {}
            try {
                b['event_data.media_player'] = b['event_data']['media_player'];
            } catch (e) {}
            try {
                b['event_data.media_play'] = b['event_data']['media_play'];
            } catch (e) {}
            try {
                b['event_action'] = b['event_action'];
            } catch (e) {}
            try {
                b['event_action_media_play_muted_autoplay'] = b['event_action']+b['event_data']['media_play']+b['event_data']['media_is_muted']+b['event_data']['media_is_autoplay'];
            } catch (e) {}
            try {
                b['event_action_media_play'] = b['event_action']+b['event_data']['media_play'];
            } catch (e) {}
            try {
                b['media_is_unmuted_start'] = b['event_data']['media_is_unmuted_start'];
            } catch (e) {}
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
