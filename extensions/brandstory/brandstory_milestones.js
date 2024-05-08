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
            window.utag.link({ event_name: 'article_milestone', event_label: milestone.label }, null, tagNumber);
        }, milestone.time);
    });
};
