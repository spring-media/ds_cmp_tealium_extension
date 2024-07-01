// Function to get value from cookie
function getCookie(cookieName) {
    const name = cookieName + '=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');

    for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i].trim();
        if (cookie.indexOf(name) === 0) {
            return cookie.substring(name.length).split(',')[1];
        }
    }
    return '';
}

// Function to get tag number from domains
function getDomainTagValue(domain) {
    if (domain.includes('welt.de')) {
        return [206];
    } else if (domain.includes('bild.de')) {
        return [10];
    } else {
        // Default values if domain doesn't match
        return [];
    }
}

// Function to send link event
function sendLinkEvent(scrollDepth, platform, pageName, tagNumber) {
    window.utag.link({
        'event_name': 'scroll depth',
        'event_action': 'view' + scrollDepth,
        'page_platform': platform,
        'adobe_pageName': pageName,
    }, null, tagNumber);
}

// Array to store scroll depths
const scrollArray = [];

/* If scroll depth is 50, 75 or 100 the request should be triggered once
for each number. To prevent multiple requests for each, we set trigger flags */
var triggered50  = false; 
var triggered75  = false; 
var triggered100 = false;

// Scroll event listener
window.addEventListener('scroll', function () {
    // Get scroll depth from cookie
    const s_ppv = getCookie('s_ppv');
    let scrollDepth = parseInt(s_ppv);

    // Get domain-specific tag number
    const tagNumber = getDomainTagValue(window.location.hostname);

    // Trigger scrolldepth request only if it has not been triggered before
    if (!triggered50 && scrollDepth === 50) {
        triggered50 = true;
        scrollArray.push(scrollDepth);
        // Send data to utag
        sendLinkEvent(scrollDepth, window.utag.data.page_platform, window.utag.data.adobe_pageName, tagNumber);
    } 
    else if (!triggered75 && scrollDepth === 75) {
        triggered75 = true;
        scrollArray.push(scrollDepth);
        // Send data to utag
        sendLinkEvent(scrollDepth, window.utag.data.page_platform, window.utag.data.adobe_pageName, tagNumber);
    } 
    else if (!triggered100 && scrollDepth === 100) {
        triggered100 = true;
        scrollArray.push(scrollDepth);
        // Send data to utag
        sendLinkEvent(scrollDepth, window.utag.data.page_platform, window.utag.data.adobe_pageName, tagNumber);
    }
});

// Create a reference to members of this unit which need to be exposed for unit testing.
const exportedFunctions = {
    getCookie,
    getDomainTagValue,
    sendLinkEvent
};

// Evaluate runtime environment (Browser or Node.js)
if (typeof exports === 'object') {
    // Expose reference to members for unit testing.
    module.exports = exportedFunctions;
}
