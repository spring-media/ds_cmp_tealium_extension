/**
 * Tracking Ready Event Extension
 *
 * This extension:
 * Dispatches a custom "tracking-ready" event on the document body
 * to signal that tracking is initialized and ready.
 *
 * Scope: DOM Ready or After Tags
 */

(function() {
    function dispatchTrackingReady(documentObj) {
        // Use global document if not provided (browser environment)
        if (typeof documentObj === 'undefined' && typeof document !== 'undefined') {
            documentObj = document;
        }

        try {
            // Dispatch tracking-ready event
            documentObj.body.dispatchEvent(new CustomEvent('tracking-ready'));
        } catch (e) {
            // Silent error handling - should not break page functionality
            console.error('[TEALIUM TRACKING READY] Error:', e);
        }
    }

    // Evaluate runtime environment (Browser or Node.js)
    if (typeof exports === 'object') {
        // Expose reference to members for unit testing.
        module.exports = { dispatchTrackingReady };
    } else {
        // Call entry point in browser
        dispatchTrackingReady();
    }
})();
