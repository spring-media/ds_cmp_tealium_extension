(function() {
    /* 1. Important event: event on_playing sends "playback_initiated_by"
     *    autoplay, user, autoplay_muted
     * 2. Important event: event unmute sends "switched_from_muted_autoplay"
     *    true when user unmutes a video initially
     *    Both events together help us map Adobe's events Media Start,
     *    Media Content Start, Unmuted Media Start.
     */
    const media_events = [
        'eof',
        'end',
        'play',
        'resume',
        'pos',
        'paused',
        'on_playing',
        'playafterAd',
        'fast_forwarding',
        'fullscreen_on',
        'fullscreen_off',
        'unmute',
        'sticky'
    ];

    const exportedFunctions = {
        run,
        init,
        getMediaAge,
        setTime,
        setEventData
    };

    const newData = window.b;

    function getMediaAge(cd, pd) {
        const currentDate = cd;
        const publishDate = new Date(pd);
        if (!isNaN(publishDate)) {
            setTime(currentDate);
            setTime(publishDate);
            const timeDiff = Math.abs(currentDate.getTime() - publishDate.getTime());
            const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            return dayDiff.toString();
        }
    }

    function setTime(d) {
        d.setMilliseconds(0);
        d.setSeconds(0);
        d.setMinutes(0);
        d.setHours(0);
    }

    function setEventData() {
        newData.linkName = 'video';
        newData.page_document_type = 'media';
        newData.event_data.media_player = 'bitmovin';
        newData.teaser_position = window.utag.data.sp_teaser_position;
        newData.teaser_block = window.utag.data.sp_teaser_block;

        // Calculate media age
        if (
            newData &&
            newData.event_data !== undefined &&
            newData.event_data.media_publication_date !== undefined
        ) {
            newData.event_data.media_age = getMediaAge(
                new Date(),
                newData.event_data.media_publication_date
            );
        }

        // Event 31 when playback_initiated_by is not autoplay-muted
        if (
            newData.event_action &&
            newData.event_action === 'on_playing' &&
            !newData.playback_initiated_by.includes('autoplay-muted')
        ) {
            sessionStorage.setItem('play_flag', 'true');
        }

        if (
            newData.event_action &&
            newData.event_action === 'play' &&
            sessionStorage.getItem('play_flag') === 'true'
        ) {
            newData.event_action_play_flag = 'true';
        }

        // Exclude muted-autoplay events on Home
        if (
            newData.event_action === 'on_playing' &&
            newData.playback_initiated_by === 'autoplay-muted' &&
            (newData.page_id === 'wDmWJyqHFeqhJHmeuqfN' ||
                newData.page_id === '22P2NufXQ03Ny17A6vwi')
        ) {
            window.utag.data.is_media_event = 'false';
        }

        // Delete event label (too many expressions in Adobe e.g., 9.87654)
        const eventActionsToDeleteLabel = [
            'pos',
            'resume',
            'paused',
            'fullscreen_on',
            'fullscreen_off',
            'play',
            'end',
            'unmute',
            'mute'
        ];

        if (eventActionsToDeleteLabel.includes(newData.event_action)) {
            delete newData.event_label;
        }

        // Media start was initiated 'from home' == Video was clicked on the homepage
        if (
            document.referrer === 'https://www.bild.de/' ||
            (document.referrer === 'https://m.bild.de/' &&
                typeof window.s._ppvPreviousPage !== 'undefined' &&
                window.s._ppvPreviousPage.indexOf('home') === 0 &&
                newData.event_action === 'on_playing')
        ) {
            newData.video_start_from_home = 'true';
        }

        for (let i = 0; i < media_events.length; i++) {
            if (newData.event_action === media_events[i]) {
                newData.is_media_event = 'true';
                // Trigger Adobe Media
                window.utag.link(newData, null, [8, 14]);
                break;
            }
        }
    }

    function run() {
        setEventData();
    }

    function init() {
        if (window.a === 'media') {
            run();
        }
    }

    // Evaluate runtime environment (Browser or Node.js)
    if (typeof exports === 'object') {
        // Expose reference to members for unit testing.
        module.exports = exportedFunctions;
    } else {
        // Call entry point in browser context.
        init();
    }
})();
