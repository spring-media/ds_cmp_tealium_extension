// Brandstory Milestones Tracking for Welt
// This is a standalone file - all conditions are inline for Tealium compatibility

// Function to get cookie value by name
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

// Get domain-specific tag number
const tagNumber = getDomainTagValue(window.location.hostname);

// Set milestones
window.onload = function setMilestones() {
    // Check if conditions are met
    if (!checkBrandstoryConditions()) {
        return;
    }

    const milestones = [
        { label: '5', time: 5000 },
        { label: '30', time: 30000 },
        { label: '60', time: 60000 },
        { label: '180', time: 180000 }
    ];

    milestones.forEach(milestone => {
        setTimeout(() => {
            // full utag.data
            const eventData = { ...window.utag.data };

            // Add custom event data
            eventData.event_name = 'article_milestone';
            eventData.event_label = milestone.label;

            // Send utag.link event with data and tag number
            window.utag.link(eventData, null, tagNumber);
        }, milestone.time);
    });
};

// Create a reference to members of this unit which need to be exposed for unit testing.
const exportedFunctions = {
    getDomainTagValue,
    checkBrandstoryConditions,
    getCookieValue
};

// Evaluate runtime environment (Browser or Node.js)
if (typeof exports === 'object') {
    // Expose reference to members for unit testing.
    module.exports = exportedFunctions;
}
