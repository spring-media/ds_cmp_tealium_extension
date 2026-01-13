/* global utag, arguments */

/**
 * Media tracking interceptor that adds event40 for first 'pos' event per media_id
 */
const installMediaTrackingInterceptor = function (alias, eventData) {
    if (!window.utag || !utag.link) return;

    if (!eventData || !eventData.event_data || !eventData.event_data.media_id) {
        return;
    }

    window._customEventRegistry = window._customEventRegistry || {
        firedFlags: {},
        originalUtagLink: null,
        interceptorInstalled: false
    };

    if (!window._customEventRegistry.interceptorInstalled) {
        window._customEventRegistry.originalUtagLink = utag.link;

        utag.link = function (data) {
            try {
                const modifiedData = { ...data };

                if (
                    data.event_action === 'pos' &&
                    data.event_data &&
                    data.event_data.media_id &&
                    !window._customEventRegistry.firedFlags['event40_' + data.event_data.media_id]
                ) {
                    modifiedData.event40 = 1;
                    window._customEventRegistry.firedFlags['event40_' + data.event_data.media_id] =
                        true;

                    console.log(
                        'Adding event40 to pos event for media_id:',
                        data.event_data.media_id
                    );
                }

                window._customEventRegistry.originalUtagLink.call(this, modifiedData);

                if (modifiedData.event40) {
                    delete utag.data.event40;
                }
            } catch (error) {
                console.error('Error in utag.link override:', error);
                window._customEventRegistry.originalUtagLink.apply(this, [data]);
            }
        };

        window._customEventRegistry.interceptorInstalled = true;
    }
};

// Execute in browser context
if (typeof arguments !== 'undefined' && typeof window !== 'undefined') {
    installMediaTrackingInterceptor(arguments[0], arguments[1]);
}

// Export for tests
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = { installMediaTrackingInterceptor };
}
