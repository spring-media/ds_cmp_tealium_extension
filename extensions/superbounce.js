// Retrieve the existing cookie and check for Adobe consent
const existingCookie = document.cookie.match(/cmp_cv_list=([a-zA-Z0-9_,-]*)/)?.pop() || '';
const isAdobeConsentGiven = existingCookie.includes('adobe_analytics');

if (
    isAdobeConsentGiven &&
    utag.data.pur_subscription?.includes('false') &&
    utag.data['cp.hasPurSubscription'] === 'false'
) {
    window.addEventListener('load', () => {
        sessionStorage.removeItem('bounce_over_5_sec');
        sessionStorage.removeItem('bounce_under_5_sec');
        sessionStorage.removeItem('super_bounce');

        setTimeout(() => {
            sessionStorage.setItem('bounce_over_5_sec', 'true');
        }, 5000);
    });

    window.addEventListener('unload', () => {
        const bounceOver5Sec = sessionStorage.getItem('bounce_over_5_sec') === 'true';
        const isArticle = utag.data.page_type?.includes('article') || utag.data.page_document_type?.includes('article');
        const isMedia = utag.data.page_type?.includes('media') || utag.data.page_document_type?.includes('video');

        if (bounceOver5Sec) {
            if (isArticle || isMedia) {
                sessionStorage.setItem('super_bounce', '5+');
                utag.data['super_bounce'] = 'true';
            }
        }
    });
}
