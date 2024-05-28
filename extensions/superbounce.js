// Retrieve the existing cookie and check for Adobe consent
const existingCookie = document.cookie.match(/cmp_cv_list=([a-zA-Z0-9_,-]*)/)?.pop() || '';
const isAdobeConsentGiven = existingCookie.includes('adobe_analytics');

if (
    isAdobeConsentGiven &&
    (window.utag.data.user_hasPurSubscription?.includes('false')
        || utag.data['cp._cpauthhint']?.includes('false'))
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
        const isArticle = window.utag.data.page_type?.includes('article') || window.utag.data.page_document_type?.includes('article');
        const isMedia = window.utag.data.page_type?.includes('video') || window.utag.data.page_document_type?.includes('media');

        if (bounceOver5Sec) {
            if (isArticle || isMedia) {
                sessionStorage.setItem('super_bounce', '5+');
                window.utag.data['super_bounce'] = 'true';
            }
        }
    });
}
