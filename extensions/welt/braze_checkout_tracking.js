/* global utag, braze */

/* Braze Library is loaded via REDO
Problem was that when a page loads library twice, braze start a new sessions
There was no way in braze to stop that or check it before
*/

/**
 * Check if braze consent is given via cookie
 */
const checkConsentGiven = () => {
    return /(^|;)\s*cmp_cv_list\s*=\s*[^;]*braze[^;]*(;|$)/.test(document.cookie);
};

/**
 * Check if user is coming from checkout
 */
const checkFromCheckout = () => {
    return (
        (typeof utag.data['dom.referrer'] != 'undefined' &&
            utag.data['dom.referrer'].toString().indexOf('paypal.com') > -1) ||
        (typeof utag.data['dom.referrer'] != 'undefined' &&
            utag.data['dom.referrer'].toString().indexOf('checkout-v2.prod.ps.welt.de') > -1) ||
        (typeof utag.data['qp.t_ref'] != 'undefined' &&
            utag.data['qp.t_ref'].toString().indexOf('checkout-v2.prod.ps.welt.de') > -1)
    );
};

/**
 * Check if user is a subscriber
 */
const checkIsSubscriber = () => {
    return utag.data.user_hasPlusSubscription2.includes('true');
};

/**
 * Track checkout success event to Braze
 */
const trackBrazeCheckout = () => {
    if (typeof braze != 'undefined') {
        braze.logCustomEvent('Checkout Success', {
            content_type: utag.data.page_document_type || '',
            entitlement_ids:
                (utag.data.user_entitlements2 && utag.data.user_entitlements2.toString()) || '',
            page_id: utag.data.page_id || '',
            offerId: utag.data['qp.offerId'] || ''
        });
    }
};

/**
 * Retry checking for Braze library with exponential backoff
 */
const retryBrazeCheck = (retryCount = 0, maxRetries = 10) => {
    if (typeof braze !== 'undefined') {
        trackBrazeCheckout();
    } else if (retryCount < maxRetries) {
        console.warn('braze: Library not loaded, retrying...');
        setTimeout(() => retryBrazeCheck(retryCount + 1, maxRetries), 100);
    } else {
        console.error('braze: Failed to load after maximum retries.');
    }
};

/**
 * Initialize braze checkout tracking if conditions are met
 */
const brazeCheckoutTracking = () => {
    const consentGiven = checkConsentGiven();
    const fromCheckout = checkFromCheckout();
    const isSubscriber = checkIsSubscriber();

    if (consentGiven && fromCheckout && isSubscriber) {
        retryBrazeCheck();
    }
};

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        checkConsentGiven,
        checkFromCheckout,
        checkIsSubscriber,
        trackBrazeCheckout,
        retryBrazeCheck,
        brazeCheckoutTracking
    };
}

// Execute in Tealium environment
if (typeof utag !== 'undefined' && typeof document !== 'undefined') {
    brazeCheckoutTracking();
}
