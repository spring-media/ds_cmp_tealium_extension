/* Based on SET DATA VALUE asbs.welt.de Platform Mobile 551 */
/* global utag, a, b */
(function(a, b) {
    try {
        if ((parseFloat(b['dom.viewport_width']) < parseFloat(600) && b['dom.domain'] == 'asbs.welt.de')) {
             b['page_platform'] = 'mobile';
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
