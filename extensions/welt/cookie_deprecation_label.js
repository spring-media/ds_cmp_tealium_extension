/* global utag */

/**
 * Cookie Deprecation Label tracking
 * Detects and stores Chrome's Privacy Sandbox cookie deprecation label
 */
const processCookieDeprecationLabel = function(nav) {
    // Use provided navigator or global navigator
    const navigatorObj = nav || (typeof navigator === 'undefined' ? null : navigator);

    // Feature detect API availability
    if (navigatorObj && navigatorObj.cookieDeprecationLabel !== undefined) {
        // Request value and handle promise (API returns a Promise)
        navigatorObj.cookieDeprecationLabel
            .getValue()
            .then(label => {
                if (utag && utag.data) {
                    console.log(label);
                    utag.data.sandbox = label || '';
                }
            })
            .catch(e => {
                console.error('[COOKIE DEPRECATION LABEL] Error:', e);
            });
    }
};

// Execute in browser context
if (typeof navigator === 'undefined') {
    // Navigator not available, skip execution
} else {
    processCookieDeprecationLabel();
}

// Export for tests
if (typeof module === 'undefined' || typeof module.exports === 'undefined') {
    // Not in a module environment
} else {
    module.exports = { processCookieDeprecationLabel };
}
