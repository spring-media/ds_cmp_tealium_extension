/* Based on SET DATA VALUE asbs.welt.de Platform Desktop 552 */
/* global utag, a, b */
(function(a, b) {
    try {
        if ((parseFloat(b['dom.viewport_width']) > parseFloat(600) && b['dom.domain'] == 'asbs.welt.de')) {
             b['page_platform'] = 'desktop';
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
