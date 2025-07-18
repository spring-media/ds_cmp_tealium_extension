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
    } else if (domain.includes('fitbook.de') || domain.includes('fitbook-magazine.com')) {
        return [31];
    } else if (domain.includes('myhomebook.de') || domain.includes('myhomebook-magazine.com')) {
        return [31];
    } else if (domain.includes('petbook.de') || domain.includes('petbook-magazine.com')) {
        return [79];
    } else if (domain.includes('stylebook.de') || domain.includes('stylebook-magazine.com')) {
        return [20];
    } else if (domain.includes('techbook.de') || domain.includes('techbook-magazine.com')) {
        return [82];
    } else if (domain.includes('travelbook.de') || domain.includes('travelbook-magazine.com')) {
        return [69];
    } else {
        // Default values if domain doesn't match
        return [];
    }
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
    // full utag.data
    var eventData = {...window.utag.data};

    // Trigger scrolldepth request only if it has not been triggered before
    if (!triggered50 && scrollDepth === 50) {
        triggered50 = true;
        scrollArray.push(scrollDepth);
        eventData.event_name = 'scroll depth',
        eventData.event_action = 'view' + scrollDepth,
        // Send data to utag
        window.utag.link(eventData, null, tagNumber);
    } 
    else if (!triggered75 && scrollDepth === 75) {
        triggered75 = true;
        scrollArray.push(scrollDepth);
        eventData.event_name = 'scroll depth',
        eventData.event_action = 'view' + scrollDepth,
        // Send data to utag
        window.utag.link(eventData, null, tagNumber);
    } 
    else if (!triggered100 && scrollDepth === 100) {
        triggered100 = true;
        scrollArray.push(scrollDepth);
        eventData.event_name = 'scroll depth',
        eventData.event_action = 'view' + scrollDepth,
        // Send data to utag
        window.utag.link(eventData, null, tagNumber);
        //sendLinkEvent(scrollDepth, window.utag.data.page_platform, window.utag.data.adobe_pageName, tagNumber);
    }
});

// Create a reference to members of this unit which need to be exposed for unit testing.
const exportedFunctions = {
    getCookie,
    getDomainTagValue,
};

// Evaluate runtime environment (Browser or Node.js)
if (typeof exports === 'object') {
    // Expose reference to members for unit testing.
    module.exports = exportedFunctions;
}
