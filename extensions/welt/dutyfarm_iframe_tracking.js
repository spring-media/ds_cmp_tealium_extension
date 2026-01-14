/**
 * Dutyfarm Iframe Tracking Extension
 *
 * This extension monitors for iframe clicks on specific game pages (Sudoku, Kreuzwortraetsel)
 * and sends tracking events when a user clicks on the iframe.
 * Uses setInterval to monitor the active element and clears after tracking.
 *
 * Scope: After Tags / DOM Ready
 */

/* global utag */

/**
 * Monitor iframe clicks and send tracking event
 * @param {Object} documentObj - Document object (for testing)
 * @param {Object} utagObj - Utag object (for testing)
 * @param {Function} setIntervalFn - setInterval function (for testing)
 * @param {Function} clearIntervalFn - clearInterval function (for testing)
 * @returns {number|null} - Interval ID or null if conditions not met
 */
function monitorIframeClick(documentObj, utagObj, setIntervalFn, clearIntervalFn) {
    // Use global objects if not provided (browser environment)
    if (typeof documentObj === 'undefined' && typeof document !== 'undefined') {
        documentObj = document;
    }
    if (typeof utagObj === 'undefined' && typeof utag !== 'undefined') {
        utagObj = utag;
    }
    if (typeof setIntervalFn === 'undefined' && typeof setInterval !== 'undefined') {
        setIntervalFn = setInterval;
    }
    if (typeof clearIntervalFn === 'undefined' && typeof clearInterval !== 'undefined') {
        clearIntervalFn = clearInterval;
    }

    try {
        // Check if URL contains required keywords
        const currentUrl = documentObj.URL || '';
        const shouldTrack =
            currentUrl.toLowerCase().includes('sudoku') ||
            currentUrl.toLowerCase().includes('kreuzwortraetsel');

        if (!shouldTrack) {
            return null;
        }

        // Monitor for iframe clicks
        const monitor = setIntervalFn(function () {
            const elem = documentObj.activeElement;
            if (elem && elem.tagName === 'IFRAME') {
                // Send tracking event
                if (utagObj && utagObj.link) {
                    utagObj.link({
                        event_name: 'dutyfarm_spiele_iframe',
                        event_action: 'click',
                        event_label: documentObj.URL.substring(
                            documentObj.URL.lastIndexOf('/') + 1
                        ).split('.')[0],
                        event_data: ''
                    });
                }
                clearIntervalFn(monitor);
            }
        }, 100);

        return monitor;
    } catch (e) {
        // Silent error handling - should not break page functionality
        console.error('[TEALIUM DUTYFARM IFRAME TRACKING] Error:', e);
        return null;
    }
}

// Export for tests
// Evaluate runtime environment (Browser or Node.js)
if (typeof exports === 'object') {
    // Expose reference to members for unit testing.
    module.exports = { monitorIframeClick };
} else {
    // Call entry point in browser
    monitorIframeClick();
}
