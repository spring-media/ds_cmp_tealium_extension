/* Based on SET DATA VALUE Adobe : Outbrain Page View eVar237 : BFF or not 568 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (typeof b['page_outbrain_model'] == 'undefined') {
            b['page_outbrain_model'] = b['outbrain_model'];
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
