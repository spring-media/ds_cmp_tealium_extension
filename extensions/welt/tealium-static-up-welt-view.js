/**
 * Tealium Configuration Override for static.up.welt.de
 * Enables view tracking on static.up.welt.de domain
 */
(function() {
    const tealiumStaticUpWeltView = function() {
        if (location.hostname !== 'static.up.welt.de') {
            return;
        }

        try {
            window.utag_cfg_ovrd = window.utag_cfg_ovrd || {};
            window.utag_cfg_ovrd = { noview: false };
        } catch (e) {
            // Silent error handling - should not break page functionality
            console.error('[TEALIUM STATIC UP] Error:', e);
        }
    };

    // Export for testing
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = tealiumStaticUpWeltView;
    } else if (typeof location !== 'undefined') {
        // Execute in Tealium environment
        tealiumStaticUpWeltView();
    }
})();
