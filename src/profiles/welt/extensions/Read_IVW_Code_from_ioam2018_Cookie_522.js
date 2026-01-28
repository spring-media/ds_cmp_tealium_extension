/* eslint-disable */
/* Based on SET DATA VALUE Read IVW Code from ioam2018 Cookie 522 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (1) {
            try {
                b['ioam2018'] = document.cookie.includes('ioam2018') ? document.cookie.match('(^|;)\\s*ioam2018\\s*=\\s*([^;]+)')[2]  : '';
            } catch (e) {}
            try {
                b['ioam2018_code'] = b.ioam2018 ? b.ioam2018.split('%3A')[6] : '';
            } catch (e) {}
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
