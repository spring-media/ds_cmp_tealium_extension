/* global utag, a, b */
/* eslint-disable-next-line no-unused-vars */
(function(a, b) {

    if (a !== 'view') { return; }
    try {
        const U = (window.utag && utag.data) || {};
        const as1 = function(v) { return (v === 1 || v === '1' || v === true || v === 'true') ? 1 : 0; };
        const arr = function(v) { return v == null ? [] : (Array.isArray(v) ? v : [v]); };

        const paid = as1(U.page_isPremium || 0);
        const subscriber = as1(U.user_hasPlusSubscription2);
        const login = as1(U.user_isLoggedIn2);
        const paywall = (paid && !subscriber) ? 'hard' : 'open';

        const meta = {
            url: document.URL,
            title: document.title,
            image: U['meta.og:image'] || '',
            type: U.page_type || 'article',
            section: U.page_sectionName || U.page_channel1 || '',
            publishtime: U.page_datePublication || '',
            modifiedtime: U.page_dateLastModified || '',
            subscriber: subscriber,
            login: login,
            paid: paid,
            paywall: paywall,
            author: arr(U.cb_authors),
            tag: arr(U.page_keywords),
            subsection: arr(U.page_channel2),
            locale: U['meta.og:locale'] || 'de-DE',
            referer: U['dom.referrer'] || document.referrer
        };

        window.k5aMeta = Object.assign({}, window.k5aMeta || {}, meta);
        if (window.utag && window.utag.cfg && window.utag.cfg.utDebug) {
            window.utag.DB('k5aMeta populated');
        }
    } catch (e) {
        if (window.utag && window.utag.cfg && window.utag.cfg.utDebug) {
            window.utag.DB('k5aMeta error: ' + e);
        }
    }
})(a, b);
