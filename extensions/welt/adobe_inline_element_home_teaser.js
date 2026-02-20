/* global a, b, utag */

/**
 * Adobe inline element home teaser tracking for WELT
 * Tracks inline element clicks on home page (escenicId 5)
 */
(function() {
    const adobeInlineElementHomeTeaser = function(a, b) {
        // Only process link events with Inline Element tracking
        if (
            a !== 'link' ||
            typeof b.event_name === 'undefined' ||
            b.event_name === 'undefined' ||
            b.event_name.indexOf('Inline Element') === -1 ||
            b.page_escenicId !== '5'
        ) {
            return;
        }

        try {
            const meinLinkEvent = b;
            const teaserelement =
                meinLinkEvent.event_label +
                '|' +
                meinLinkEvent.event_data.target +
                '|' +
                meinLinkEvent.event_data['source'];

            utag.loader.SC('utag_main', { hti: teaserelement }, 'session');
            utag.loader.SC('utag_main', { tb: meinLinkEvent.event_label }, 'session');
        } catch (e) {
            // Silent error handling - should not break other extensions
            console.error('[ADOBE INLINE ELEMENT] Error:', e);
        }
    };

    // Export for testing
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = adobeInlineElementHomeTeaser;
    } else if (typeof a !== 'undefined' && typeof b !== 'undefined') {
        // Execute in Tealium environment
        adobeInlineElementHomeTeaser(a, b);
    }
})();
