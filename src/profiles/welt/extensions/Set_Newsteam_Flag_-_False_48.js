/* eslint-disable */
/* Based on SET DATA VALUE Set Newsteam Flag - False 48 */
/* global utag, a, b */
(function(a, b) {
    try {
        if ((typeof b['page_keywords_string'] != 'undefined' && b['page_keywords_string'].toString().indexOf('Newsteam') < 0)) {
             b['page_isNewsteam'] = 'false';
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
