/* global window, utag */
/* eslint-disable @typescript-eslint/no-shadow */

/**
 * doPlugins for Welt - Liveticker
 * Sets eVar41 to "liveticker" when page_type is "live"
 */

const s = window.s || window.cmp || {};

/**
 * Helper function to check if page type is live
 * @returns {boolean} True if page type is "live"
 */
s._isLivetickerPage = function() {
    if (typeof window.utag === 'undefined' || !window.utag.data) {
        return false;
    }
    return window.utag.data.page_type === 'live';
};

/**
 * Sets liveticker specific variables
 * @param {Object} s - Adobe Analytics object
 */
s._setLivetickerVariables = function(s) {
    if (this._isLivetickerPage()) {
        s.eVar41 = 'liveticker';
    }
};

/**
 * Main doPlugins function
 * @param {Object} s - Adobe Analytics object
 */
s.doPlugins = function(s) {
    s._setLivetickerVariables(s);
    
    // Call global doPlugins if available
    if (typeof s._doPluginsGlobal === 'function') {
        s._doPluginsGlobal(s);
    }
};

// Evaluate runtime environment
if (typeof exports === 'object') {
    // Export s-object with all functions for unit testing
    module.exports = s;
}
