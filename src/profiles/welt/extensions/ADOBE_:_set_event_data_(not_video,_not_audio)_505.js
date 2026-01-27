/* Based on SET DATA VALUE ADOBE : set event_data (not video, not audio) 505 */
/* global utag, a, b */
(function(a, b) {
    try {
        if (1) {
            try {
                b['offer_id'] = b.event_data != undefined && b.event_data.product_id != undefined  ? b.event_data.product_id : '';
            } catch (e) {}
            try {
                b['offer_title'] = b.event_data != undefined && b.event_data.offer_title != undefined  ? b.event_data.offer_title : '';
            } catch (e) {}
            try {
                b['price'] = '1'.split();
            } catch (e) {}
            try {
                b['quantity'] = b.event_data != undefined && b.event_data.price != undefined  ? b.event_data.price : '';
            } catch (e) {}
            try {
                b['placement'] = b.event_data != undefined && b.event_data.identifier != undefined  ? b.event_data.identifier : '';
            } catch (e) {}
            try {
                b['price_description'] = b.event_data != undefined && b.event_data.price_description != undefined  ? b.event_data.price_description : '';
            } catch (e) {}
            try {
                b['price_period'] = b.event_data != undefined && b.event_data.price_period != undefined  ? b.event_data.price_period : '';
            } catch (e) {}
            try {
                b['trackingLabel'] = b.event_data != undefined && b.event_data.trackingLabel != undefined  ? b.event_data.trackingLabel : '';
            } catch (e) {}
            try {
                b['price_description_dots'] = b.event_data != undefined ? b.event_data.price_description.map(value => value.replace(/,/g, ".")) : '';
            } catch (e) {}
            try {
                b['price_dots'] = b.event_data != undefined ? b.event_data.price.map(value => value.replace(/,/g, ".")) : '';
            } catch (e) {}
            try {
                b['offer_title_dots'] = b.event_data != undefined ? b.event_data.offer_title.map(value => value.replace(/,/g, ".")) : '';
            } catch (e) {}
        }
    } catch (e) {
        window.utag.DB(e);
    }
})();
