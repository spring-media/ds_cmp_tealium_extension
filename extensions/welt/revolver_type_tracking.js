/* global utag */

/**
 * Revolver Type Tracking
 * Manages revolver_type in event_data based on video events
 * - Sets revolver_type when revolverload action occurs on EndScreen
 * - Clears revolver_type on cancel action or non-video events
 */
const processRevolverTypeTracking = function() {
    // Early return if utag or utag.data is not available
    if (typeof utag === 'undefined' || !utag.data) {
        return;
    }

    // Initialize event_data if it doesn't exist
    if (utag.data.event_data === undefined) {
        utag.data.event_data = {};
    }

    // Handle video events
    if (utag.data.event_name === 'video') {
        // Set revolver_type when revolverload action occurs on EndScreen
        if (
            utag.data.event_action?.includes('revolverload') &&
            utag.data.event_data['media_placement'] === 'EndScreen'
        ) {
            utag.data.event_data['revolver_type'] = utag.data.event_action;
            console.log(
                "utag.data.event_data['revolver_type'] set event_revolverType " +
                    utag.data.event_data['revolver_type']
            );
        }

        // Clear revolver_type on cancel action
        if (utag.data.event_action?.includes('cancel')) {
            utag.data.event_data['revolver_type'] = '';
            console.log(
                'utag.data.event_revolverType cancel ' + utag.data.event_data['revolver_type']
            );
        }
    } else if (
        // Handle non-video events: clear revolver_type if it exists
        utag.data.event_data !== undefined &&
        utag.data.event_data['revolver_type'] !== undefined
    ) {
        utag.data.event_data['revolver_type'] = '';
        console.log(
            "utag.data.event_data['revolver_type'] delete " + utag.data.event_data['revolver_type']
        );
    }
};

// Execute in browser context
if (typeof window !== 'undefined') {
    processRevolverTypeTracking();
}

// Export for tests
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = { processRevolverTypeTracking };
}
