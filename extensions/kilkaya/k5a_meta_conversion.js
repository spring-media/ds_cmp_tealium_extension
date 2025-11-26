/* Pre Loader — k5aMeta conversion for checkout success */
/* global utag, a, b */
/* eslint-disable-next-line no-unused-vars */
(function (a, b) {
    try {
        if (String(b.event_name) !== 'checkout' || String(b.event_action) !== 'success') {
            return;
        }

        // Ensure meta object exists
        if (!window.k5aMeta || typeof window.k5aMeta !== 'object') {
            window.k5aMeta = {};
        }

        // Mark conversion (Kilkaya conversion flag)
        window.k5aMeta.conversion = 1;

        // Prepare cntTag array
        if (!Array.isArray(window.k5aMeta.cntTag)) {
            window.k5aMeta.cntTag = [];
        }

        if (b.offer_id) {
            window.k5aMeta.cntTag.push('offer_' + String(b.offer_id));
        }

        utag.DB('k5aMeta conversion set for checkout success');

    } catch (e) {
        utag.DB('k5aMeta conversion error: ' + e);
    }
})(a, b);
