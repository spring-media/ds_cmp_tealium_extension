/**
 * Random ID Generator Extension
 *
 * This extension generates a random global event ID and assigns it to utag.data
 * based on page type (WON frontpage or article).
 *
 * Scope: Before Load Rules
 */

/* global utag */

(function() {
    /**
     * Generates a random ID by concatenating three random numbers
     * @returns {string} Random ID string
     */
    const generateRandomId = function() {
        return (
            Math.random() * 89999999999999999 +
            '' +
            Math.random() * 89999999999999999 +
            '' +
            Math.random() * 89999999999999999
        );
    };

    /**
     * Sets the global event ID on window object
     * @param {string} randomId - The random ID to set
     */
    const setGlobalEventId = function(randomId) {
        if (typeof window !== 'undefined') {
            window.global_event_id = randomId;
        }
    };

    /**
     * Assigns the random ID to appropriate utag.data property based on page type
     * @param {string} randomId - The random ID to assign
     */
    const assignRandomIdToUtagData = function(randomId) {
        if (typeof utag === 'undefined' || !utag.data) {
            return;
        }

        // Check if page is WON frontpage
        if (utag.data.page_sectionName && utag.data.page_sectionName === 'WON frontpage') {
            utag.data.global_event_id = randomId;
        } else if (utag.data.page_type && utag.data.page_type === 'article') {
            // Check if page is an article
            utag.data.global_event_id_article = randomId;
        }
    };

    /**
     * Main initialization function that generates and assigns random ID
     */
    const initRandomId = function() {
        const randomId = generateRandomId();

        // Log the generated ID for debugging
        console.log(randomId);

        // Set on window object
        setGlobalEventId(randomId);

        // Assign to utag.data based on page type
        assignRandomIdToUtagData(randomId);
    };

    // Export for tests
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = {
            generateRandomId,
            setGlobalEventId,
            assignRandomIdToUtagData,
            initRandomId
        };
    } else if (typeof window !== 'undefined' && typeof utag !== 'undefined') {
        // Execute in browser context
        initRandomId();
    }
})();
