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

// Get domain-specific tag number
const tagNumber = getDomainTagValue(window.location.hostname);

// Set milestones
window.onload = function setMilestones() {
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
    getDomainTagValue
};

// Evaluate runtime environment (Browser or Node.js)
if (typeof exports === 'object') {
    // Expose reference to members for unit testing.
    module.exports = exportedFunctions;
}
