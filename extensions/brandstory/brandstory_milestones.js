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

// Get consent cookie and check Adobe consent
const consentCookie = document.cookie.match(/cmp_cv_list=([a-zA-Z0-9_,-]*)/)?.pop() || '';
const isAdobeConsentGiven = consentCookie.includes('adobe_analytics');

// Get domain-specific exntension number
const extensionNumber = getDomainExtensionValue(window.location.hostname);

// If Adobe consent is given, set milestones
if (isAdobeConsentGiven) {
    window.onload = function setMilestones() {
        const milestones = [
            { label: '5', time: 5000 },
            { label: '30', time: 30000 },
            { label: '60', time: 60000 },
            { label: '180', time: 180000 }
        ];

        milestones.forEach(milestone => {
            setTimeout(() => {
                window.utag.link({ event_name: 'article_milestone', event_label: milestone.label }, null, extensionNumber);
            }, milestone.time);
        });
    };
}
