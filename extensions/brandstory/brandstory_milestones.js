// Function to get tag number from domains
function getDomainTagValue(domain) {
    if (domain.includes('welt.de')) {
        return [206];
    } else if (domain.includes('bild.de')) {
        return [10];
    } else if (domain.includes('techbook.de')) {
        return [69];
    } else if (domain.includes('stylebook.de')) {
        return [20];
    } else if (domain.includes('petbook.de')) {
        return [79];
    } else if (domain.includes('travelbook.de')) {
        return [35];
    } else if (domain.includes('myhomebook.de')) {
        return [31];
    } else if (domain.includes('fitbook.de')) {
        return [31];
    } else {
        // Default values if domain doesn't match
        return [];
    }
}

// Get domain-specific tag number
const tagNumber = getDomainTagValue(window.location.hostname);

// Set milestones
window.onload = function setMilestones() {
    const milestones = [{
            label: '5',
            time: 5000
        },
        {
            label: '30',
            time: 30000
        },
        {
            label: '60',
            time: 60000
        },
        {
            label: '180',
            time: 180000
        }
    ];

    milestones.forEach(milestone => {
        setTimeout(() => {
            window.utag.link({
                event_name: 'article_milestone',
                event_label: milestone.label,
                adobe_pageName: window.utag.data.adobe_pageName,
                page_escenicId: window.utag.data.page_escenicId,
                page_platform: window.utag.data.page_platform,
                page_type: window.utag.data.page_type,
                page_sectionPath: window.utag.data.page_sectionPath
            }, null, tagNumber);
        }, milestone.time);
    });
};
