/* eslint-disable */
/* Based on SET DATA VALUE Google Prop is_conversion 341 */
/* global utag, a, b */
(function(a, b) {
    try {
        if ((typeof b['cp.utag_main_va'] != 'undefined' && b['cp.utag_main_va'].toString().toLowerCase() == 'false'.toLowerCase() && typeof b['page_isPremium'] != 'undefined' && b['page_isPremium'].toString().toLowerCase() == 'true'.toLowerCase())) {
            b['gps_userEvent'] = 'paywall';
        }
    } catch (e) {
        window.utag.DB(e);
    }
})(a, b);
