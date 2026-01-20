// Brandstory Scroll Depth Tracking for Welt
// This is a standalone file - all conditions are inline for Tealium compatibility

// Function to get value from cookie (for scroll depth tracking)
function getCookie(cookieName) {
    const name = cookieName + '=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');

    for (let i = 0; i < cookieArray.length; i++) {
        const cookie = cookieArray[i].trim();
        if (cookie.indexOf(name) === 0) {
            return cookie.substring(name.length).split(',')[1];
        }
    }
    return '';
}

// Function to get cookie value by name (general purpose)
function getCookieValue(cookieName) {
    const name = cookieName + '=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');

    for (let i = 0; i < cookieArray.length; i++) {
        const cookie = cookieArray[i].trim();
        if (cookie.indexOf(name) === 0) {
            return cookie.substring(name.length);
        }
    }
    return '';
}

// Function to check if conditions are met for brandstory tracking
function checkBrandstoryConditions() {
    const data = window.utag && window.utag.data ? window.utag.data : {};
    const url = window.location.href.toLowerCase();

    // Check if consentedVendors contains adobe_analytics
    const hasAdobeAnalytics =
        data.consentedVendors && data.consentedVendors.includes('adobe_analytics');

    // Check if hasPurSubscription (from cookie) does not equal true
    const hasPurSubscriptionCookie = getCookieValue('hasPurSubscription');
    const noPurSubscription = hasPurSubscriptionCookie !== 'true';

    // Check if consentedVendors is defined
    const consentedVendorsDefined =
        data.consentedVendors !== undefined && data.consentedVendors !== null;

    // Check if page_type equals article
    const isArticle = data.page_type && data.page_type === 'article';

    if (!hasAdobeAnalytics || !noPurSubscription || !consentedVendorsDefined) {
        return false;
    }

    // Condition Group 1: Sponsored Content in URL
    const isSponsored = url.includes('sponsored') && isArticle;

    // Condition Group 2: Advertorials in URL
    const isAdvertorial = url.includes('advertorials') && isArticle;

    // Condition Group 3: Brand-Story in page_keywords_string
    const isBrandStory =
        data.page_keywords_string &&
        data.page_keywords_string.toLowerCase().includes('brand-story') &&
        isArticle;

    // Condition Group 4: Product-Story-Selection in page_keywords_string
    const isProductStorySelection =
        data.page_keywords_string &&
        data.page_keywords_string.toLowerCase().includes('product-story-selection');

    // Condition Group 5: Product Stories in URL
    const isProductStories = url.includes('productstorys') && isArticle;

    return (
        isSponsored || isAdvertorial || isBrandStory || isProductStorySelection || isProductStories
    );
}

// Function to get tag number for Welt domain
function getDomainTagValue(domain) {
    if (domain.includes('welt.de')) {
        return [206];
    }
    return [];
}

// Array to store scroll depths
const scrollArray = [];

/* If scroll depth is 50, 75 or 100 the request should be triggered once
for each number. To prevent multiple requests for each, we set trigger flags */
let triggered50 = false;
let triggered75 = false;
let triggered100 = false;

// Scroll event listener
window.addEventListener('scroll', function() {
    // Check if conditions are met
    if (!checkBrandstoryConditions()) {
        return;
    }

    // Get scroll depth from cookie
    const s_ppv = getCookie('s_ppv');
    const scrollDepth = parseInt(s_ppv, 10);

    // Get domain-specific tag number
    const tagNumber = getDomainTagValue(window.location.hostname);
    // full utag.data
    const eventData = { ...window.utag.data };

    // Trigger scrolldepth request only if it has not been triggered before
    if (!triggered50 && scrollDepth === 50) {
        triggered50 = true;
        scrollArray.push(scrollDepth);
        eventData.event_name = 'scroll depth';
        eventData.event_action = 'view' + scrollDepth;
        // Send data to utag
        window.utag.link(eventData, null, tagNumber);
    } else if (!triggered75 && scrollDepth === 75) {
        triggered75 = true;
        scrollArray.push(scrollDepth);
        eventData.event_name = 'scroll depth';
        eventData.event_action = 'view' + scrollDepth;
        // Send data to utag
        window.utag.link(eventData, null, tagNumber);
    } else if (!triggered100 && scrollDepth === 100) {
        triggered100 = true;
        scrollArray.push(scrollDepth);
        eventData.event_name = 'scroll depth';
        eventData.event_action = 'view' + scrollDepth;
        // Send data to utag
        window.utag.link(eventData, null, tagNumber);
    }
});

// Create a reference to members of this unit which need to be exposed for unit testing.
const exportedFunctions = {
    getCookie,
    getCookieValue,
    getDomainTagValue,
    checkBrandstoryConditions
};

// Evaluate runtime environment (Browser or Node.js)
if (typeof exports === 'object') {
    // Expose reference to members for unit testing.
    module.exports = exportedFunctions;
}
