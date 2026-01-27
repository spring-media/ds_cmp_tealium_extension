/* Based on SET DATA VALUE ConsentedVendor_amp 414 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (1) {
            try {
                b['consentedVendor_amp'] = window.utag.data['consentedVendor_amp'].toString();
            } catch (e) {}
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
