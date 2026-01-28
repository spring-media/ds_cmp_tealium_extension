/* eslint-disable */
/* Based on SET DATA VALUE Set Param – productStatus - view 53 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (b['page_type'] != 'section') {
             b['wt_product_status'] = 'view';
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
