/* eslint-disable */
/* Based on SET DATA VALUE Google Prop sessionStorage GetItem 224 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (1) {
            try {
                b['google_propens'] = sessionStorage.getItem("google_prop");
            } catch (e) {}
        }
    } catch (e) {
        window.utag.DB(e);
    }
})(a, b);
