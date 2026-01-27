/* Based on SET DATA VALUE Event data 430 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (1) {
            b['media_title'] = b['event_data.media_title'];
            b['media_id'] = b['event_data.media_id'];
            b['media_path'] = b['event_data.media_path'];
            b['media_is_live'] = b['event_data.media_is_live'];
            b['media_is_premium'] = b['event_data.media_is_premium'];
            b['media_datePublication'] = b['event_data.media_datePublication'];
            b['media_source'] = b['event_data.media_source'];
            b['media_placement'] = b['event_data.media_placement'];
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
