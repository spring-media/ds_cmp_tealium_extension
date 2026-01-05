/* global utag, a, b */

// This extension normalizes media_id and media_headline for video link events.
// It handles two player types:
// - Xymatic: takes media_id and media_headline directly from event_data
// - Non-Xymatic: extracts media_id from contentID and media_headline from event object

(function(a, b) {

    // Only run on link events where event_name === "video"
    if (a !== 'link' || !b || b.event_name !== 'video') {
        return;
    }

    let mediaID = '';
    let mediaHeadline = '';

    // --- 1) Access event_data safely ---
    const ed = (b.event_data && typeof b.event_data === 'object') ? b.event_data : {};
    const player = String(ed.media_player || '').toLowerCase();

    // --- 2) Xymatic: take mediaID + headline directly from data ---
    if (player === 'xymatic') {

        // media_id from event_data
        if (ed.media_id) {
            mediaID = ed.media_id;
        }

        // headline comes from xymatic_media_headline set in the datalayer by a different extension
        if (ed.media_headline) {
            mediaHeadline = ed.media_headline;
        }
    }

    // --- 3) Non-Xymatic : MEDIA ID from contentID if not yet set ---
    if (!mediaID) {
        let cid = utag.data.contentID;

        if (!cid || typeof cid !== 'string') return;

        cid = cid.trim().replace(/^\"+|\"+$/g, '');

        if (cid.indexOf('content-discovery') > -1) {
            mediaID = cid.split('/')[4] || '';
        } else {
            mediaID = cid.split('/')[3] || '';
        }

        if (!mediaID) return;
    }

    // --- 4) MEDIA HEADLINE for non-Xymatic: only if present on the event object ---
    if (!mediaHeadline && player !== 'xymatic') {
        if (b.media_headline) {
            mediaHeadline = b.media_headline;
        } else if (b.headline) {
            mediaHeadline = b.headline;
        }
    }

    // --- 5) Apply results to global data layer ---
    if (mediaID) {
        utag.data.media_id = mediaID;
        b.media_id = mediaID;
    }

    if (mediaHeadline) {
        utag.data.media_headline = mediaHeadline;
        b.media_headline = mediaHeadline;
    }

})(a, b);
