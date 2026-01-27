/* Based on SET DATA VALUE ADOBE : set page_platform for not BFF pages only 307 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (typeof b['page_layoutBreakpoint'] != 'undefined') {
            try {
                b['page_platform'] = utag.data.page_layoutBreakpoint == 'small' ? utag.data.page_platform = 'mobile' : 'desktop';
            } catch (e) {}
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
