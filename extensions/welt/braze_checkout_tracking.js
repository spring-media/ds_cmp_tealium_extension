/* global utag, braze */
/* eslint-disable no-console */
/*Braze Library is loaded via REDO
    Problem was that when a page loads library twice, braze start a new sessions
    There was no way in braze to stop that or check it before
*/
const consentGiven = /(^|;)\s*cmp_cv_list\s*=\s*[^;]*braze[^;]*(;|$)/.test(document.cookie) ;
const fromCheckout = (typeof utag.data['dom.referrer'] != 'undefined' && utag.data['dom.referrer'].toString().indexOf('paypal.com') > -1) || (typeof utag.data['dom.referrer'] != 'undefined' && utag.data['dom.referrer'].toString().indexOf('checkout-v2.prod.ps.welt.de') > -1) || (typeof utag.data['qp.t_ref'] != 'undefined' && utag.data['qp.t_ref'].toString().indexOf('checkout-v2.prod.ps.welt.de') > -1);
const isSubscriber = utag.data.user_hasPlusSubscription2.includes('true');


function trackBrazeCheckout() {
    if (typeof braze != 'undefined'){
        braze.logCustomEvent('Checkout Success', {
            content_type: utag.data.page_document_type || '',
            entitlement_ids: utag.data.user_entitlements2.toString() || '',
            page_id: utag.data.page_id || '',
            offerId: utag.data['qp.offerId'] || '',
            
        });
        
    }
    
}

let retryCount = 0;
const maxRetries = 10;

function retryBrazeCheck() {
    if (typeof braze !== 'undefined') {
        trackBrazeCheckout();
    } else if (retryCount < maxRetries) {
        console.warn('braze: Library not loaded, retrying...');
        retryCount++;
        setTimeout(retryBrazeCheck, 100);
    } else {
        console.error('braze: Failed to load after maximum retries.');
    }
}

if (consentGiven && fromCheckout && isSubscriber) {
    retryBrazeCheck();
}
