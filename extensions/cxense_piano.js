// Function to get short segment ID from domains
function getShortSegmentID(domain) {
    const segmentIds = {
        'welt.de': '4fea5b05fa97c40ca24d19373adb161c344008bf',
        'bild.de': '1bb0283fe6bf0c26d91e4997c5b5afa1bf6f9d07'
    };

    for (const key in segmentIds) {
        if (domain.includes(key)) {
            return segmentIds[key];
        }
    }

    return null;
}

if (window.cX?.getUserSegmentIds) {
    const shortSegmentID = getShortSegmentID(window.location.hostname);
    const segmentPqs = {
        [shortSegmentID]: 'short',
        '9a4060edca15bc6ed4a5f88cf474f3116f3ddb07': 'long'
    };

    const segmentInfo = localStorage.getItem('_cX_segmentInfo');
    if (segmentInfo) {
        const segments = segmentInfo.split('/').reduce((acc, curr) => {
            const [key, , value] = curr.split('_');
            acc[segmentPqs[key]] = `.${value}.`;
            return acc;
        }, {});

        window.utag.data.piano_short = segments.short;
        console.log('Debug Segments:', window.utag.data.piano_short);

        /* Below request is triggered only for welt as for unknown tealium 
        setup reasons the segmentIDs are not set up in welt pageview requests. 
        Hence a pageview request is triggered to set this explicitly */

        if (window.location.hostname.includes('welt.de')) {
            window.utag.view({ 'piano_short': window.utag.data.piano_short, 'cxense_segments': 'true' }, null, [147]);
        }
    }
}
