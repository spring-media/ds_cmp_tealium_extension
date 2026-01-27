/* Based on SET DATA VALUE Adlib AdvertisingBranch (Clicks) 471 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (1) {
            try {
                b['advertisingBranch'] = (window.ASCDP && window.ASCDP.pageSet.branch) || 'noAdlib';
            } catch (e) {}
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
