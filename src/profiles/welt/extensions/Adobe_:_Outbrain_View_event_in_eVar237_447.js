/* Based on SET DATA VALUE Adobe : Outbrain View event in eVar237 447 */
/* global utag, a, b */
(function(a, b) {
    try {
        if ((b['event_name'] == 'outbrain' || b['event_name'] == 'Outbrain')) {
            b['outbrain_model_view'] = b['event_label'];
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
