/* global a, b, utag */

/**
 * LSA (Lesen Sie Auch) tracking for inline teaser clicks
 * Tracks "Read Also" inline teaser interactions and sets session storage
 */
const processLsaTracking = function (a, b) {
    // Check if event data exists
    if (!b || typeof b !== 'object') {
        return;
    }

    // Check if it's a link event with inline teaser criteria
    // Note: Using direct undefined comparison (instead of typeof) as per project convention
    // This may trigger ESLint warnings but is intentional for consistency
    if (
        a === 'link' &&
        b.event_name !== undefined &&
        b.event_name === 'Inline Element' &&
        b.event_label !== undefined &&
        b.event_label === 'inlineTeaser_'
    ) {
        try {
            // Set LSA cookie to session storage
            utag.loader.SC('utag_main', { lsa: '1' }, 'session');

            // Create modified event object for LSA tracking
            const lsa = { ...b };
            lsa.event_name = 'Lesen Sie Auch';
            lsa.event_action = 'click';

            // Fire tracking event with tag 206
            utag.link(lsa, null, [206]);
        } catch (e) {
            // Silent error handling - should not break other extensions
            console.error('[LSA TRACKING] Error:', e);
        }
    } else if (a !== 'link') {
        try {
            // Reset LSA cookie for non-link events
            utag.loader.SC('utag_main', { lsa: '0' }, 'session');
        } catch (e) {
            // Silent error handling
            console.error('[LSA TRACKING] Error resetting LSA:', e);
        }
    }
};

// Execute in browser context
if (typeof a !== 'undefined' && typeof b !== 'undefined') {
    processLsaTracking(a, b);
}

// Export for tests
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = { processLsaTracking };
}
