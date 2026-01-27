/* Based on SET DATA VALUE Blaetterkatalog Platform 425 */
/* global utag, a, b */
(function(a, b) {
    try {
        if ((parseFloat(b['dom.viewport_width']) < parseFloat(600) && b['dom.domain'] == 'blaetterkatalog.welt.de')) {
             b['page_platform'] = 'mobile';
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
