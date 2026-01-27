/* Based on SET DATA VALUE Adobe : Podigee APP Standalone 432 */
/* global utag, a, b */
(function(a, b) {
    try {
        if ((b['page_name'] == 'Podigee-Standalone' && b['page_type'] == 'app')) {
            try {
                b['adobe_pageName'] = b.page_type + " : " + b.page_name;
            } catch (e) {}
            b['page_platform'] = b['page_type'];
            b['app_name'] = 'WELT News';
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
