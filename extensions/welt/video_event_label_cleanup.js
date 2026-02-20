/* global utag */

/**
 * Video Event Label Cleanup
 * Deletes event_label for specific video event actions
 */
(function() {
    const processVideoEventLabelCleanup = function() {
        // Early return if utag or utag.data is not available
        if (typeof utag === 'undefined' || !utag.data) {
            return;
        }

        const eventActionsToDeleteLabel = [
            'pos',
            'resume',
            'paused',
            'fullscreen_on',
            'fullscreen_off',
            'play',
            'end',
            'unmute',
            'mute'
        ];

        // Check if event_name is 'video' and event_action is in the list
        if (
            utag.data.event_name !== 'undefined' &&
            utag.data.event_name !== '' &&
            utag.data.event_name === 'video' &&
            eventActionsToDeleteLabel.includes(utag.data.event_action)
        ) {
            delete utag.data.event_label;
        }
    };

    // Export for tests
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = { processVideoEventLabelCleanup };
    } else if (typeof window !== 'undefined') {
        // Execute in browser context
        processVideoEventLabelCleanup();
    }
})();
