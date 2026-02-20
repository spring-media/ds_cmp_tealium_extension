/**
 * Before Load Rules Data Merge Extension
 *
 * This extension:
 * 1. Merges data from b object into utag.data
 * 2. Sets the ut.env variable based on the utag.cfg.path
 * 3. For go.welt.de domain, additionally merges data from a object
 *
 * Scope: Before Load Rules
 */

/* global utag, a, b */

(function() {
    const beforeLoadRulesDataMerge = function() {
        try {
            // Merge b object into utag.data
            if (typeof b !== 'undefined' && typeof utag !== 'undefined' && utag.ut) {
                utag.ut.merge(b, utag.data, 0);
                utag.ut.merge(utag.data, b, 1);
            }

            // Set environment variable if not already set
            if (typeof utag !== 'undefined' && typeof utag.data['ut.env'] === 'undefined') {
                if (utag.cfg && utag.cfg.path) {
                    const env = utag.cfg.path.split('/');
                    utag.data['ut.env'] = env[env.length - 2];
                }
            }

            // For go.welt.de domain, merge a object
            if (location.hostname.includes('go.welt.de')) {
                if (typeof a !== 'undefined' && typeof utag !== 'undefined' && utag.ut) {
                    utag.ut.merge(a, utag.data, 0);
                    utag.ut.merge(utag.data, a, 1);
                }
            }
        } catch (e) {
            // Silent error handling - should not break page functionality
            console.error('[TEALIUM BEFORE LOAD RULES] Error:', e);
        }
    };

    // Export for tests
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = { beforeLoadRulesDataMerge };
    } else if (typeof window !== 'undefined' && typeof utag !== 'undefined') {
        // Execute in browser context
        beforeLoadRulesDataMerge();
    }
})();
