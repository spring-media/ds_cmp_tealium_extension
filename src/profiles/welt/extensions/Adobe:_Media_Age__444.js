/* Based on SET DATA VALUE Adobe: Media Age  444 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (b['event_name'].toString().indexOf('video') > -1) {
            try {
                b['media_age'] = calcDate(b.event_data.media_datePublication.substring(0, 10));     	function calcDate(d){var d1 = new Date();var d2 = new Date(d);if(isNaN(d2) == false) {shortenDate(d1);shortenDate(d2);         var timeDiff = Math.abs(d1.getTime() - d2.getTime());var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));return diffDays.toString();}} 		function shortenDate(d) {d.setMilliseconds(0);     d.setSeconds(0);d.setMinutes(0);d.setHours(0);}    ;
            } catch (e) {}
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
