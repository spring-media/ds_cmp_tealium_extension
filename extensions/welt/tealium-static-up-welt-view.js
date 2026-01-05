(function () {
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
})();
