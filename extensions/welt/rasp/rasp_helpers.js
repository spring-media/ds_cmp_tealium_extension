/**
 * Rasp Helpers
 *
 * Helper functions extracted from Adobe doPlugins for use with Rasp tracking.
 * These functions extract teaser tracking values from utag.data.
 *
 * Scope: After Load Rules / Extensions
 */

const RaspHelpers = {
    /**
     * Get teaser brand from CID query parameter
     * @returns {string} Last segment of cid value
     */
    getTeaserBrandFromCID: function() {
        if (!window.utag || !window.utag.data) {
            return '';
        }
        let teaserBrand = '';

        const cid = window.utag.data['qp.cid'];
        if (cid) {
            // return last segment of cid (e.g., kooperation.home.outbrain.desktop.AR_2.stylebook)
            teaserBrand = cid.split('.').pop();
        }
        return teaserBrand;
    },

    /**
     * Get tracking value from various sources
     * Priority: teaser brand from CID > cookie hti > query param dtp
     * @returns {string} Tracking value or empty string
     */
    getTrackingValue: function() {
        if (!window.utag || !window.utag.data) {
            return '';
        }
        const teaserBrand = this.getTeaserBrandFromCID();
        return (
            teaserBrand ||
            window.utag.data['cp.utag_main_hti'] ||
            window.utag.data['qp.dtp'] ||
            ''
        );
    },

    /**
     * Get block value from cookie or query parameter
     * Returns only the first segment before underscore
     * @returns {string} Block value or empty string
     */
    getBlockValue: function() {
        if (!window.utag || !window.utag.data) {
            return '';
        }
        const teaserBlock =
            window.utag.data['cp.utag_main_tb'] ||
            window.utag.data['qp.tbl'] ||
            '';
        return teaserBlock.split('_')[0];
    },

    /**
     * Get page ID from utag.data
     * Priority: page_id > page_escenicId
     * @returns {string} Page ID or empty string
     */
    getPageId: function() {
        if (!window.utag || !window.utag.data) {
            return '';
        }
        return (
            window.utag.data.page_id || window.utag.data.page_escenicId || ''
        );
    },

    /**
     * Get Adobe campaign value (eVar88 equivalent)
     * Priority: cid > wtrid > wtmc > wt_mc
     * @returns {string} Campaign string in format "param=value" or empty string
     */
    getCID: function() {
        if (!window.utag || !window.utag.data) {
            return '';
        }
        if (typeof window.utag.data['qp.cid'] !== 'undefined') {
            return 'cid=' + window.utag.data['qp.cid'];
        }
        if (typeof window.utag.data['qp.wtrid'] !== 'undefined') {
            return 'wtrid=' + window.utag.data['qp.wtrid'];
        }
        if (typeof window.utag.data['qp.wtmc'] !== 'undefined') {
            return 'wtmc=' + window.utag.data['qp.wtmc'];
        }
        if (typeof window.utag.data['qp.wt_mc'] !== 'undefined') {
            return 'wt_mc=' + window.utag.data['qp.wt_mc'];
        }
        return '';
    },

    /**
     * Get ICID (Internal Campaign ID) from query parameter (eVar78/eVar79 equivalent)
     * @returns {string} ICID value or empty string
     */
    getICID: function() {
        if (!window.utag || !window.utag.data) {
            return '';
        }
        return window.utag.data['qp.icid'] || '';
    },

    /**
     * Get all teaser tracking data as an object
     * Useful for adding to ringDataLayer or other tracking systems
     * @returns {Object} Object with trackingValue, blockValue, pageId, and combined teaserPositionPage
     */
    getTeaserTrackingData: function() {
        const trackingValue = this.getTrackingValue();
        const blockValue = this.getBlockValue();
        const pageId = this.getPageId();

        return {
            trackingValue: trackingValue,
            blockValue: blockValue,
            pageId: pageId,
            teaserPositionPage:
                trackingValue && pageId ? `${trackingValue}|${pageId}` : ''
        };
    },

    /**
     * Get page reload status from Performance API (eVar32 equivalent)
     * Returns navigation type: navigate, reload, back_forward, or prerender
     * @returns {string} Navigation type or empty string
     */
    getPageReloadStatus: function() {
        return (
            (window.performance &&
                window.performance.getEntriesByType &&
                window.performance
                    .getEntriesByType('navigation')
                    .map((nav) => nav.type)
                    .toString()) ||
            ''
        );
    },

    /**
     * Get advertising branch with user group from localStorage (eVar219 equivalent)
     * Returns branch_userGroup format or just branch if no userGroup available
     * @returns {string} Advertising branch string or 'noAdlib' if not available
     */
    getAdvertisingBranch: function() {
        const branch = window.ASCDP?.pageSet?.branch || 'noAdlib';
        try {
            const lsKey = 'asadTls';
            if (
                typeof localStorage !== 'undefined' &&
                localStorage.getItem(lsKey)
            ) {
                const asadTlsStr = localStorage.getItem(lsKey);
                const asadTls = JSON.parse(asadTlsStr);
                if (asadTls?.springUGAdobe) {
                    return branch + '_' + asadTls.springUGAdobe;
                }
            }
        } catch {
            // Silent fail - return branch without userGroup
        }
        return branch;
    },

    /**
     * Get all tracking data including campaign and ICID
     * @returns {Object} Complete tracking data object
     */
    getAllTrackingData: function() {
        return {
            ...this.getTeaserTrackingData(),
            cid: this.getCID(),
            icid: this.getICID(),
            pageReloadstatus: this.getPageReloadStatus(),
            adLibBranch: this.getAdvertisingBranch()
        };
    }
};

// Export for use in other extensions
if (typeof window !== 'undefined') {
    window.RaspHelpers = RaspHelpers;
}

// Export for tests
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = RaspHelpers;
}
