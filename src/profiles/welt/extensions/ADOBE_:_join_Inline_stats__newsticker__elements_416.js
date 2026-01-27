/* Based on SET DATA VALUE ADOBE : join Inline stats /newsticker/ elements 416 */
/* global utag, a, b */
(function(a, b) {
    try {
        if ((b['event_name'] == 'Inline Element' && b['event_label'] == 'header_')) {
            try {
                b['event_data.target'] = b['event_data']['target']+b['event_data']['trackingName'];
            } catch (e) {}
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
