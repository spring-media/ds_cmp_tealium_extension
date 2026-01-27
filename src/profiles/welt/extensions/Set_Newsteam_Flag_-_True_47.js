/* Based on SET DATA VALUE Set Newsteam Flag - True 47 */
/* global utag, a, b */
(function(a, b) {
    try {
        if ((typeof b['page_keywords_string'] != 'undefined' && b['page_keywords_string'].toString().indexOf('Newsteam') > -1)) {
             b['page_isNewsteam'] = 'true';
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
