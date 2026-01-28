/* eslint-disable */
/* Based on SET DATA VALUE Adobe : page_escenicId (wetter.welt, profil.welt...) 481 */
/* global utag, a, b */
(function(a, b) {
    try {
        if ((b['dom.domain'] == 'wetter.welt.de' || b['dom.domain'] == 'profil.welt.de')) {
            try {
                b['page_escenicId'] = location.hostname.split('.')[0];
            } catch (e) {}
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
