/* Based on SET DATA VALUE Copy Google Prop has_purchased 346 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (b['dom.query_string'].toString().toLowerCase().indexOf('notify=success_subscription'.toLowerCase()) > -1) {
             b['gps_userEvent'] = 'payment_complete';
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
