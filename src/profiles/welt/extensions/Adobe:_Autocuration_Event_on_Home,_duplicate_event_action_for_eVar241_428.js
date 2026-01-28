/* eslint-disable */
/* Based on SET DATA VALUE Adobe: Autocuration Event on Home, duplicate event_action for eVar241 428 */
/* global utag, a, b */
(function(a, b) {
    try {
        if ((b['event_name'] == 'autocuration' && b['event_action'] != 'stop' && b['page_channel1'] == 'home' && typeof b['consentedVendors'] != 'undefined' && b['consentedVendors'].toString().indexOf('adobe_analytics') > -1)) {
            b['autocuration_event_variant_pv'] = b['event_action'];
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
