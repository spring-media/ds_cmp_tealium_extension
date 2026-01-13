/**
 * Tealium Configuration Override for static.up.welt.de
 * Enables view tracking on static.up.welt.de domain
 */
const configureStaticUpView = function () {
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

// Execute in browser context
if (typeof window !== 'undefined' && typeof location !== 'undefined') {
    configureStaticUpView();
}

// Export for tests
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = { configureStaticUpView };
}
