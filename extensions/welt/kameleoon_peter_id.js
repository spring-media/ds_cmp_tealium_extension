/**
 * Kameleoon Peter ID Extension
 *
 * This extension sets custom data for Kameleoon with the Peter ID value
 * from utag.data.peterId. It pushes a function to the Kameleoon queue
 * that will execute when Kameleoon is ready.
 *
 * Scope: After Tags / DOM Ready
 */

/* global utag */

/**
 * Set Peter ID in Kameleoon
 * @param {Object} windowObj - Window object (for testing)
 * @param {Object} utagObj - Utag object (for testing)
 */
function setKameleoonPeterId(windowObj, utagObj) {
    // Use global objects if not provided (browser environment)
    if (typeof windowObj === 'undefined' && typeof window !== 'undefined') {
        windowObj = window;
    }
    if (typeof utagObj === 'undefined' && typeof utag !== 'undefined') {
        utagObj = utag;
    }

    try {
        // Initialize kameleoonQueue if it doesn't exist
        windowObj.kameleoonQueue = windowObj.kameleoonQueue || [];

        // Check if utag.data and peterId exist and peterId is not 'false'
        if (utagObj && utagObj.data && utagObj.data.peterId && utagObj.data.peterId !== 'false') {
            // Push function to Kameleoon queue
            windowObj.kameleoonQueue.push(() => {
                // Set custom data in Kameleoon
                windowObj.Kameleoon.API.Data.setCustomData('peterId', utagObj.data.peterId);
            });
        }
    } catch (e) {
        // Silent error handling - should not break page functionality
        console.error('[TEALIUM KAMELEOON PETER ID] Error:', e);
    }
}

// Export for tests
// Evaluate runtime environment (Browser or Node.js)
if (typeof exports === 'object') {
    // Expose reference to members for unit testing.
    module.exports = { setKameleoonPeterId };
} else {
    // Call entry point in browser
    setKameleoonPeterId();
}
