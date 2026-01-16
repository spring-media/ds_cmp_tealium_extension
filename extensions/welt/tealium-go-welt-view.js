/**
 * Tealium Configuration Override for go.welt.de
 *
 * This extension disables automatic view tracking on go.welt.de domain
 * by setting utag_cfg_ovrd.noview to true.
 *
 * Scope: Pre Loader
 * Note: This extension runs unconditionally in the Pre Loader scope
 */

(function() {
    if (!location.hostname.includes('go.welt.de')) {
        return;
    }

    try {
        window.utag_cfg_ovrd = window.utag_cfg_ovrd || {};
        window.utag_cfg_ovrd = {
            noview: true
        };
    } catch (e) {
        // Silent error handling - should not break page functionality
        console.error('[TEALIUM GO WELT] Error:', e);
    }
})();
