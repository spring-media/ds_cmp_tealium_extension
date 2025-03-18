(function() {
    /* 1. important event: event on_playing sends "playback_initiated_by" autoplay, user, autoplay_muted 
     *  2. important event: event unmute send "switched_from_muted_autoplay" true when user unmute a video initially
     *  Both events together helps us to mapp Adobes events Media Start, Media Content Start, Unmuted Media Start
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
        'sticky',
    ];

    const exportedFunctions = {
        run,
        init,
        getMediaAge,
        setTime,
        setEventData
    };

    var newData = window.b;

    function getMediaAge(cd, pd) {
        var currentDate = cd;
        var publishDate = new Date(pd);
        if (!isNaN(publishDate)) {
            setTime(currentDate);
            setTime(publishDate);
            var timeDiff = Math.abs(currentDate.getTime() - publishDate.getTime());
            var dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
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

        //calcualte media age
        if (
            newData &&
      newData.event_data != undefined &&
      newData.event_data.media_publication_date !== undefined
        ) {
            newData.event_data.media_age = this.getMediaAge(
                new Date(),
                newData.event_data.media_publication_date
            );
        }
        //event31 when playback_initiated_by not autoplay-muted
        if (newData.event_action && newData.event_action == 'on_playing' && !newData.playback_initiated_by.includes('autoplay-muted')) {
            sessionStorage.setItem('play_flag', 'true');
        
        }
    
        if (newData.event_action && newData.event_action == 'play' && sessionStorage.getItem('play_flag') === 'tru') {
            newData.event_action_play_flag = 'true';
        
        }


        //exclude muted-autoplay Events on Home
        if (
            newData.event_action === 'on_playing' &&
      newData.playback_initiated_by == 'autoplay-muted' &&
      (newData.page_id == 'wDmWJyqHFeqhJHmeuqfN' ||
        newData.page_id == '22P2NufXQ03Ny17A6vwi')
        ) {
            window.window.utag.data.is_media_event = 'false';
        }

        //delete event label (too many expressions in Adobe (e.g. 9.87654))
        const eventActionsToDeleteLabel = [
            'pos',
            'resume',
            'paused',
            'fullscreen_on',
            'fullscreen_off',
            'play',
            'end',
            'unmute',
            'mute',
        ];

        if (eventActionsToDeleteLabel.includes(newData.event_action)) {
            delete newData.event_label;
        }

        //Media start was initiated 'from home' == Video was clicked at homepage
        if (
            document.referrer === ('https://www.bild.de/' || 'https://m.bild.de/') &&
      typeof window.s._ppvPreviousPage != 'undefined' &&
      window.s._ppvPreviousPage.indexOf('home') === 0 &&
      newData.event_action === 'on_playing'
        ) {
            newData.video_start_from_home = 'true';
        }

        for (var i = 0; i < media_events.length; i++) {
            if (
                newData.event_action === media_events[i] 
            ) {
                newData.is_media_event = 'true';
                //trigger Adobe Media
                window.utag.link(newData, null, [8, 14]);
      
                break;
            }
        }}

    function run() {
        exportedFunctions.setEventData();
    }

    function init() {
        if (window.a === 'media') {
            exportedFunctions.run();
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