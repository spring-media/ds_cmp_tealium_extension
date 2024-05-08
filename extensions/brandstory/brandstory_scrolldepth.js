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

// Array to store scroll depths
const scrollArray = [];

// Scroll event listener
window.addEventListener('scroll', function () {
    // Get scroll depth from cookie
    const s_ppv = getCookie('s_ppv');
    let scrollDepth = parseInt(s_ppv);

    // Get domain-specific tag number
    const tagNumber = getDomainTagValue(window.location.hostname);

    // Check scroll depth
    if (scrollDepth <= 100) {
        // Check if scroll depth is 50, 75 or 100
        if (scrollDepth === 50 || scrollDepth === 75 || scrollDepth === 100) {
            scrollArray.push(scrollDepth);
            // Send data to utag
            window.utag.link({
                'event_name': 'scroll depth',
                'event_action': 'view' + scrollDepth,
                'page_platform': window.utag.data.page_platform,
                'adobe_pageName': window.utag.data.adobe_pageName,
            }, null, tagNumber);
        }
    }
});
