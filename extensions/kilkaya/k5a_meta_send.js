/* Post Loader — Send Kilkaya conversion tracking */
/* global a, b */
/* eslint-disable-next-line no-unused-vars */
(function (a, b) {
    try {
        if (String(b.event_name) !== 'checkout' || String(b.event_action) !== 'success') {
            return;
        }

        // Helper to log to localStorage (survives redirect)
        var persistLog = function(message, data) {
            try {
                var log = {
                    timestamp: new Date().toISOString(),
                    message: message,
                    data: data
                };
                localStorage.setItem('k5a_send_log', JSON.stringify(log));
                console.log('[K5A SEND] ' + message, data);
            } catch (e) {
                console.log('[K5A SEND] ' + message, data);
            }
        };

        persistLog('Checkout success detected', {k5aMeta: window.k5aMeta});

        // Wait for k5aMeta.conversion to be set by conversion extension
        setTimeout(function() {
            try {
                // Build the tracking URL manually based on Kilkaya's format
                var installationId = '68ee5be64709bd7f4b3e3bf2';
                var baseUrl = 'https://cl-eu10.k5a.io/';
                
                // Get page data
                var pageData = window.k5aMeta || {};
                
                // Build query parameters for Kilkaya
                var params = [];
                params.push('i=' + encodeURIComponent(installationId));
                params.push('l=p'); // pageview log type
                params.push('cs=1'); // conversion status = 1
                params.push('_s=conversion');
                params.push('_m=b'); // method=beacon
                
                
                // Add conversion-specific data
                if (pageData.conversion) params.push('cv=' + pageData.conversion);
                if (pageData.cntTag && Array.isArray(pageData.cntTag) && pageData.cntTag.length > 0) {
                    params.push('cntt=' + encodeURIComponent(pageData.cntTag.join(',')));
                }
                
                var trackingUrl = baseUrl + '?' + params.join('&');
                
                persistLog('Tracking URL built', {url: trackingUrl});
                
                // Try sendBeacon first (best for page unloads)
                if (navigator.sendBeacon) {
                    var sent = navigator.sendBeacon(trackingUrl);
                    
                    if (sent) {
                        persistLog('✓ SUCCESS: Sent via sendBeacon', {
                            url: trackingUrl,
                            method: 'sendBeacon'
                        });
                        return;
                    }
                }
                
                // Fallback: try kilkaya API if available
                if (window.kilkaya && window.kilkaya.logger && 
                    typeof window.kilkaya.logger.fireNow === 'function') {
                    
                    var logData = window.kilkaya.pageData.getDefaultData();
                    logData.cs = 1; // conversion
                    window.kilkaya.logger.fireNow('pageView', logData, 'conversion');
                    persistLog('✓ SUCCESS: Sent via Kilkaya API', {method: 'kilkaya.logger.fireNow'});
                    return;
                }
                
            } catch (err) {
                persistLog('✗ ERROR sending conversion', {error: err.message, stack: err.stack});
            }
        }, 150); // Small delay to ensure k5aMeta.conversion is set

    } catch (e) {
        try {
            localStorage.setItem('k5a_send_log', JSON.stringify({
                timestamp: new Date().toISOString(),
                message: '✗ CRITICAL ERROR',
                data: {error: e.message, stack: e.stack}
            }));
        } catch (storageErr) {
            console.error('[K5A SEND] Error:', e);
        }
    }
})(a, b);
