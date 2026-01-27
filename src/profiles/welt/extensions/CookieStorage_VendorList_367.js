/* Based on SET DATA VALUE CookieStorage VendorList 367 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (1) {
            try {
                b['consentedVendors'] = document.cookie.includes('cmp_cv_list') ? b['consentedVendors'] =  document.cookie.match('(^|;)\\s*cmp_cv_list\\s*=\\s*([^;]+)')[2]  : b['consentedVendors'] = '';
            } catch (e) {}
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
