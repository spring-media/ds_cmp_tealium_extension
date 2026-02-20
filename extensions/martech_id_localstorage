/**
 * Martech ID (mtid) of UTIQ Layer LocalStorage Extension
 *
 * This extension reads Martech ID data from localStorage and populates utag.data
 * with martech object and martechId value. 
 *
 * Scope: Before Load Rules
 */

/* global utag */

(function() {
    const STORAGE_KEY = 'asadEls_utiq';
    const DEFAULT_MARTECH_ID = 'false';

    /**
     * Initialize Martech ID from localStorage
     */
    const initMartechId = function() {
        try {
            // Initialize utag.data if not exists
            utag.data = utag.data || {};

            // Get data from localStorage
            const storedData = localStorage.getItem(STORAGE_KEY);

            if (storedData) {
                // Parse and store the martech object
                utag.data.martech = JSON.parse(storedData);
                // Extract martechId from nested structure, default to 'false' if not found
                utag.data.martechId = utag.data.martech?.ids?.mtid || DEFAULT_MARTECH_ID;
            } else {
                // Set default value if localStorage is empty
                utag.data.martechId = DEFAULT_MARTECH_ID;
            }
        } catch (e) {
            // Silent error handling - should not break page functionality
            console.error('[TEALIUM MARTECH ID] Error:', e);
            // Ensure martechId is set even on error
            if (typeof utag !== 'undefined' && utag.data) {
                utag.data.martechId = 'false';
            }
        }
    };

    // Execute in browser context
    if (typeof window !== 'undefined' && typeof utag !== 'undefined') {
        initMartechId();
    }

    // Export for tests
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = { initMartechId, STORAGE_KEY, DEFAULT_MARTECH_ID };
    }
})();
