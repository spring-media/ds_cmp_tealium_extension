/* Based on SET DATA VALUE Adobe: Outbrain eVar113 for paywall event 475 */
/* global utag, a, b */
(function(a, b) {
    try {
        if ((b['event_name'] == 'offer-module' && typeof b['qp.cid'] != 'undefined' && b['qp.cid'].toString().indexOf('.outbrain.') > -1)) {
            b['outbrain_cid_for_paywall_only'] = b['qp.cid'];
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
