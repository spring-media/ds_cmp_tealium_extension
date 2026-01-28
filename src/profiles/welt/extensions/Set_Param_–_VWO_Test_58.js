/* eslint-disable */
/* Based on SET DATA VALUE Set Param – VWO Test 58 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (1) {
            try {
                b['page_vwoTest'] = getAbTestVariant();  function getAbTestVariant() {     if(typeof _vwo_exp_ids !== "undefined") {         var abteststring = "";         var expObject = null;         for(index in _vwo_exp_ids) {             expObject = _vwo_exp[_vwo_exp_ids[index]];              if(typeof expObject.combination_chosen !== "undefined") {                 abteststring += _vwo_exp_ids[index] + ": " + expObject.comb_n[expObject.combination_chosen] + ';';             }         }          return abteststring.substring(0, abteststring.length - 1);     } };
            } catch (e) {}
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
