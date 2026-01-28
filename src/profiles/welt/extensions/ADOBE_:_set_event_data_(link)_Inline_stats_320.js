/* eslint-disable */
/* Based on SET DATA VALUE ADOBE : set event_data (link) Inline stats 320 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (1) {
            try {
                b['event_data.target'] = b['event_data']['target'];
            } catch (e) {}
            try {
                b['event_data.source'] = b['event_data']['source'];
            } catch (e) {}
            try {
                b['event_name'] = b['event_name'];
            } catch (e) {}
            try {
                b['trackingName'] = b['event_data']['trackingName'];
            } catch (e) {}
            try {
                b['event_data.searchphrase'] = b['event_data']['searchphrase'];
            } catch (e) {}
            try {
                b['event_data.filter'] = b['event_data']['filter'];
            } catch (e) {}
            try {
                b['event_data.filteroption'] = b['event_data']['filteroption'];
            } catch (e) {}
            try {
                b['event_data.filterset'] = b['event_data']['filter'] + ' ' + (b['event_data']['filteroption'] || '');
            } catch (e) {}
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
