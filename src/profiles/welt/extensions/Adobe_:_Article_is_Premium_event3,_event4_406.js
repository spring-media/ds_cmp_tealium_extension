/* Based on SET DATA VALUE Adobe : Article is Premium event3, event4 406 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (b['page_type'] == 'article') {
            try {
                b['page_isPremium_article'] = (b['page_isPremium'] && b['page_type'] =='article') ? b['page_isPremium_article'] = b['page_isPremium']  : b['page_isPremium_article']='';
            } catch (e) {}
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
