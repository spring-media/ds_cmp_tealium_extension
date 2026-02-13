/* eslint-disable */
/* Based on SET DATA VALUE Google Activity Tag Random-Variable 295 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (1) {
            try {
                b['a_rand'] = (Math.random()+"")*10000000000000;
            } catch (e) {}
        }
    } catch (e) {
        window.utag.DB(e);
    }
})(a, b);
