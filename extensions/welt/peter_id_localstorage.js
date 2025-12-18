/**
 * Peter ID LocalStorage Extension
 *
 * This extension reads Peter ID data from localStorage and populates utag.data
 * with peter object and peterId value.
 *
 * Scope: Before Load Rules
 */

/* global utag */

(function () {
    try {
        const STORAGE_KEY = 'asadEls_se';
        const DEFAULT_PETER_ID = 'false';

        // Initialize utag.data if not exists
        utag.data = utag.data || {};

        // Get data from localStorage
        const storedData = localStorage.getItem(STORAGE_KEY);

        if (storedData) {
            // Parse and store the peter object
            utag.data.peter = JSON.parse(storedData);

            // Extract peterId from nested structure, default to 'false' if not found
            utag.data.peterId = utag.data.peter?.ids?.peter || DEFAULT_PETER_ID;
        } else {
            // Set default value if localStorage is empty
            utag.data.peterId = DEFAULT_PETER_ID;
        }
    } catch (e) {
        // Silent error handling - should not break page functionality
        console.error('[TEALIUM PETER ID] Error:', e);
        // Ensure peterId is set even on error
        if (typeof utag !== 'undefined' && utag.data) {
            utag.data.peterId = 'false';
        }
    }
})();
