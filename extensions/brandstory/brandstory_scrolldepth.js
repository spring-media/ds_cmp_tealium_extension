// Function to get value from cookie
function getCookie(cookieName) {
    const name = cookieName + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');

    for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i].trim();
        if (cookie.indexOf(name) === 0) {
            return cookie.substring(name.length).split(",")[1];
        }
    }
    return "";
}

// Function to get extension number from domains
function getDomainExtensionValue(domain) {
    if (domain.includes('welt.de')) {
        return [206];
    } else if (domain.includes('bild.de')) {
        return [10];
    } else {
        // Default values if domain doesn't match
        return [];
    }
}

// Array to store scroll depths
const scrollArray = [];

// Scroll event listener
window.addEventListener("scroll", function () {
    // Get scroll depth from cookie
    const s_ppv = getCookie("s_ppv");
    let scrollDepth = parseInt(s_ppv);

    // Check if consent for Adobe is given
    const existingCookie = document.cookie.match(/cmp_cv_list=([a-zA-Z0-9_,-]*)/)?.pop() || '';
    const isAdobeConsentGiven = existingCookie.includes('adobe_analytics');

    // Get domain-specific exntension number
    const extensionNumber = getDomainExtensionValue(window.location.hostname);

    // Check scroll depth and consent for Adobe
    if (scrollDepth <= 100 && isAdobeConsentGiven) {
        // Check if scroll depth is 50, 75 or 100
        if (scrollDepth === 50 || scrollDepth === 75 || scrollDepth === 100) {
            scrollArray.push(scrollDepth);
            // Send data to utag
            utag.link({
                "event_name": "scroll depth",
                "event_action": "view" + scrollDepth,
                "page_platform": utag.data.page_platform,
                "adobe_pageName": utag.data.adobe_pageName,
            }, null, extensionNumber);
        }
    }
});
